"use server";

import { revalidatePath } from "next/cache";
import { getBrand } from "@/lib/brand";
import { textosInicio } from "@/components/home/textosInicio";
import { CONFIG_EMISOR } from "./_datos/config";
import { exigirSesion } from "./_datos/sesion";
import { adaptadorExtras } from "./_datos/adaptador";
import { cancelarProgramado, programar } from "./_datos/qstash";
import type { ResultadoEstado } from "./encender";

// "Estoy bien" (E-08): confirmar desde los 30 min previos a la hora del aviso hasta la hora.
// Solo se da por confirmado cuando el servidor lo ha guardado (E1). Al confirmar:
//  - se guarda la confirmación;
//  - el aviso pasa a su siguiente plazo (a diario: mañana; días elegidos: el siguiente día) y se
//    reprograma el disparo en QStash; "Solo hoy" termina y el aviso se apaga.
// Límite conocido: los días elegidos se calculan con el día UTC (todavía no se guarda la zona horaria).

function siguientePlazo(fire: Date, recurrencia: string, dias: number[]): Date | null {
  const DIA = 86_400_000;
  if (recurrencia === "daily") return new Date(fire.getTime() + DIA);
  if (recurrencia === "weekly" && dias.length) {
    for (let i = 1; i <= 7; i++) {
      const d = new Date(fire.getTime() + i * DIA);
      if (dias.includes(d.getUTCDay())) return d;
    }
  }
  return null; // "Solo hoy": no hay siguiente.
}

export async function confirmarEstoyBien(): Promise<ResultadoEstado> {
  const s = await exigirSesion();
  const t = textosInicio(getBrand().variant).confirmar;
  const falla = (error = t.error): ResultadoEstado => ({ ok: false, error });

  const { data: aviso, error: errA } = await s.supabase
    .from("notices")
    .select("id, fire_at, recurrence, grace_minutes, qstash_message_id")
    .eq("issuer_id", s.user.id)
    .eq("state", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (errA || !aviso) return falla();

  const fire = new Date(aviso.fire_at as string);
  const ahora = Date.now();
  const graciaMs = ((aviso.grace_minutes as number | null) ?? 0) * 60_000;
  if (ahora < fire.getTime() - CONFIG_EMISOR.ventanaConfirmarMin * 60_000) return falla(t.temprano);
  // Se puede confirmar hasta el final del tiempo de gracia: entonces sale el aviso a los contactos.
  if (ahora >= fire.getTime() + graciaMs) return falla(t.tarde);

  const { error: errC } = await s.supabase.from("confirmations").insert({ issuer_id: s.user.id, notice_id: aviso.id, source: "app" });
  if (errC) return falla();

  const extras = await adaptadorExtras(s.supabase).leerAviso(s.user.id, aviso.id as string).catch(() => null);
  const siguiente = siguientePlazo(fire, aviso.recurrence as string, extras?.dias ?? []);

  let nuevoId: string | null = null;
  if (siguiente) {
    const p = await programar(aviso.id as string, new Date(siguiente.getTime() + graciaMs));
    if (!p.ok) return falla();
    nuevoId = p.messageId;
  }

  const cambios = siguiente
    ? { fire_at: siguiente.toISOString(), qstash_message_id: nuevoId, updated_at: new Date().toISOString() }
    : { state: "off", qstash_message_id: null, updated_at: new Date().toISOString() };
  const { error: errU } = await s.supabase.from("notices").update(cambios).eq("id", aviso.id).eq("state", "active");
  if (errU) {
    await cancelarProgramado(nuevoId);
    return falla();
  }
  // El disparo anterior ya no vale. Si no se pudiera borrar, /api/alert lo ignora: el aviso ya no es el mismo plazo.
  await cancelarProgramado(aviso.qstash_message_id as string | null);

  revalidatePath("/home");
  return { ok: true };
}
