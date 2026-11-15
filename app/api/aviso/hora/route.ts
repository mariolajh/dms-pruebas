import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { createClient } from "@supabase/supabase-js";
import { getBrand } from "@/lib/brand";
import { sendPushToUser } from "@/lib/push";

// POST /api/aviso/hora
// Lo llama QStash a la HORA del aviso (no al final del tiempo de gracia). Le manda a quien emite una
// notificación "Es hora de confirmar": desde ahí empieza a contar la gracia. No cambia el estado del aviso
// ni avisa a nadie más: eso lo hace /api/alert al acabar la gracia.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
  });
  try {
    await receiver.verify({ signature: req.headers.get("upstash-signature") ?? "", body });
  } catch {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
  }

  let datos: { notice_id?: string; fire_at?: string } = {};
  try {
    datos = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }
  if (!datos.notice_id || !datos.fire_at) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false } });

  const { data: aviso, error } = await admin
    .from("notices")
    .select("id, issuer_id, state, fire_at, grace_minutes")
    .eq("id", datos.notice_id)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: "Error al leer el aviso" }, { status: 500 });

  // Solo vale si el aviso sigue encendido y es el mismo plazo: si confirmó o lo apagó, ya no hace falta.
  const mismoPlazo = aviso && Math.abs(new Date(aviso.fire_at).getTime() - new Date(datos.fire_at).getTime()) < 1000;
  if (!aviso || aviso.state !== "active" || !mismoPlazo) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const gracia = (aviso.grace_minutes as number | null) ?? 0;
  const push = await sendPushToUser(admin, aviso.issuer_id, {
    title: getBrand().name,
    body: gracia > 0 ? `Es hora de confirmar. Tienes ${gracia} min para decir que estás bien.` : "Es hora de confirmar que estás bien.",
    url: "/home",
  }).catch(() => ({ sent: 0 }));

  return NextResponse.json({ ok: true, push_sent: push.sent });
}
