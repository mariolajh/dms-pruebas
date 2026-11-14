import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import { textosHome } from "@/components/home/textos";
import { textosInicio } from "@/components/home/textosInicio";
import InicioApagado from "@/components/home/InicioApagado";
import InicioActivo from "@/components/home/InicioActivo";
import InicioAlerta from "@/components/home/InicioAlerta";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { avisoActual } from "@/app/aviso/_datos/sesion";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { listaNombres, primerNombre } from "@/app/aviso/_datos/formato";
import { rellenar } from "@/components/aviso/textos";

// Sin aviso o con el aviso apagado: pantallas del flujo de quien emite (onboarding / Inicio apagado).
// Encendido o en alerta: sigue el placeholder del núcleo con E6, hasta construir las portadas 02 a 05.
export async function generateMetadata() {
  return { title: textosInicio(getBrand().variant).titulo };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ alerta?: string; encendido?: string; apagado?: string; confirmado?: string }>;
}) {
  const { alerta, encendido, apagado, confirmado } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // El perfil y el aviso se piden a la vez: cada consulta es un viaje a la base.
  const [{ data: profile }, aviso] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).single(),
    avisoActual({ supabase, user }),
  ]);

  const brand = getBrand();
  const textos = textosHome(brand.variant);

  // Desvío tras el login (Figma: «¿Cómo está su aviso?»):
  // sin aviso → onboarding · apagado → Inicio apagado · encendido / en alerta → lo de abajo.
  if (!aviso) redirect("/alta");
  if (aviso.state === "off") {
    const [{ data: filas }, extrasAviso, { data: todosAceptados }, { count: confirmaciones }] = await Promise.all([
      supabase.from("notice_contacts").select("position, contacts(id, name, status, accepted_at)").eq("notice_id", aviso.id).order("position"),
      adaptadorExtras(supabase).leerAviso(user.id, aviso.id).catch(() => null),
      // Contactos que ya aceptaron (para saber si alguno está fuera de este aviso).
      supabase.from("contacts").select("id, name").eq("issuer_id", user.id).eq("status", "accepted"),
      // Si ya confirmó alguna vez (o canceló una alerta), el aviso ya se usó: el cuadro de "aceptó" ya no hace falta.
      supabase.from("confirmations").select("id", { count: "exact", head: true }).eq("issuer_id", user.id),
    ]);
    const contactos = (filas ?? [])
      .map((f) => (Array.isArray(f.contacts) ? f.contacts[0] : f.contacts) as { id: string; name: string; status: string; accepted_at: string | null } | null)
      .filter((c): c is { id: string; name: string; status: string; accepted_at: string | null } => !!c && c.status !== "removed");
    // "Aún no responde" solo vale si la invitación salió. Si no salió, se dice eso.
    const extras = await adaptadorExtras(supabase)
      .leerContactos(user.id, contactos.map((c) => c.id))
      .catch(() => ({}) as Record<string, DatosContacto>);
    const enviada = (c: { id: string }) => !!extras[c.id]?.invitacionEnviadaEn;
    const aceptados = contactos.filter((c) => c.status === "accepted").map((c) => primerNombre(c.name));
    // Contactos que ya aceptaron pero no están dentro de este aviso (el nombre sale de la base).
    const dentro = new Set(contactos.map((c) => c.id));
    const aceptadosFuera = (todosAceptados ?? []).filter((c) => !dentro.has(c.id)).map((c) => primerNombre(c.name));
    // Cuadro "X aceptó tu invitación": solo con aceptados recientes (7 días) que ya están en el aviso.
    const hace7 = Date.now() - 7 * 86_400_000;
    const recientes = (confirmaciones ?? 0) > 0 ? [] : contactos.filter((c) => c.status === "accepted" && c.accepted_at && new Date(c.accepted_at).getTime() > hace7).map((c) => primerNombre(c.name));
    // Quienes se dieron de baja desde su correo en los últimos 30 días: Inicio dice que se fueron.
    const { data: salidas } = await supabase
      .from("contacts")
      .select("name")
      .eq("issuer_id", user.id)
      .eq("status", "rejected")
      .gt("removed_at", new Date(Date.now() - 30 * 86_400_000).toISOString());
    const tI = textosInicio(brand.variant);
    return (
      <InicioApagado
        avisoAceptacion={recientes.length ? { titulo: rellenar(recientes.length === 1 ? tI.aceptoUno : tI.aceptoVarios, { nombres: listaNombres(recientes) }), texto: tI.aceptoTexto, enlace: tI.verContactos } : undefined}
        aceptadosFuera={aceptadosFuera}
        salieron={(salidas ?? []).map((c) => primerNombre(c.name as string))}
        t={textosInicio(brand.variant)}
        app={brand.name}
        nombre={primerNombre(profile?.full_name ?? "")}
        aceptados={aceptados}
        apagadoAhora={apagado === "1"}
        canceladaAhora={alerta === "cancelada" ? textos.canceladaTitulo : undefined}
        plazo={{ fireAt: aviso.fire_at, frecuencia: aviso.recurrence as Frecuencia, dias: extrasAviso?.dias ?? [] }}
        pendientes={contactos.filter((c) => c.status === "pending" && enviada(c)).map((c) => primerNombre(c.name))}
        sinEnviar={contactos.filter((c) => c.status === "pending" && !enviada(c)).map((c) => primerNombre(c.name))}
        vacio={contactos.length === 0}
        rechazados={contactos.filter((c) => c.status === "rejected").map((c) => primerNombre(c.name))}
      />
    );
  }

  // Alerta en curso: Inicio con la alerta y el botón para cancelar (mantener 2 s).
  if (aviso.state === "alert") {
    return <InicioAlerta t={textosInicio(brand.variant)} textos={textos} app={brand.name} nombre={primerNombre(profile?.full_name ?? "")} />;
  }

  // Aviso encendido (E-02 Activo), con su ventana de confirmar y su tiempo de gracia.
  const extrasAviso = await adaptadorExtras(supabase).leerAviso(user.id, aviso.id).catch(() => null);
  return (
    <InicioActivo
      t={textosInicio(brand.variant)}
      app={brand.name}
      nombre={primerNombre(profile?.full_name ?? "")}
      encendidoAhora={encendido === "1"}
      confirmadoAhora={confirmado === "1"}
      graciaMin={(aviso.grace_minutes as number | null) ?? 0}
      plazo={{ fireAt: aviso.fire_at, frecuencia: aviso.recurrence as Frecuencia, dias: extrasAviso?.dias ?? [] }}
    />
  );
}
