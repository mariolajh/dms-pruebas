import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";
import SignOutButton from "@/components/auth/SignOutButton";
import TestEmailButton from "@/components/auth/TestEmailButton";
import NoticeForm from "@/components/notices/NoticeForm";
import PushButton from "@/components/pwa/PushButton";
import CancelarAlerta from "@/components/home/CancelarAlerta";
import { textosHome } from "@/components/home/textos";
import { textosInicio } from "@/components/home/textosInicio";
import InicioApagado from "@/components/home/InicioApagado";
import InicioActivo from "@/components/home/InicioActivo";
import type { Frecuencia } from "@/app/aviso/_datos/tipos";
import { avisoActual } from "@/app/aviso/_datos/sesion";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { primerNombre } from "@/app/aviso/_datos/formato";

// Sin aviso o con el aviso apagado: pantallas del flujo de quien emite (onboarding / Inicio apagado).
// Encendido o en alerta: sigue el placeholder del núcleo con E6, hasta construir las portadas 02 a 05.
export async function generateMetadata() {
  return { title: textosInicio(getBrand().variant).titulo };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ alerta?: string; encendido?: string; apagado?: string }>;
}) {
  const { alerta, encendido, apagado } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  const brand = getBrand();
  const textos = textosHome(brand.variant);

  // Desvío tras el login (Figma: «¿Cómo está su aviso?»):
  // sin aviso → onboarding · apagado → Inicio apagado · encendido / en alerta → lo de abajo.
  const aviso = await avisoActual({ supabase, user });
  if (!aviso) redirect("/alta");
  if (aviso.state === "off") {
    const { data: filas } = await supabase
      .from("notice_contacts")
      .select("position, contacts(id, name, status)")
      .eq("notice_id", aviso.id)
      .order("position");
    const contactos = (filas ?? [])
      .map((f) => (Array.isArray(f.contacts) ? f.contacts[0] : f.contacts) as { id: string; name: string; status: string } | null)
      .filter((c): c is { id: string; name: string; status: string } => !!c && c.status !== "removed");
    // "Aún no responde" solo vale si la invitación salió. Si no salió, se dice eso.
    const extras = await adaptadorExtras(supabase)
      .leerContactos(user.id, contactos.map((c) => c.id))
      .catch(() => ({}) as Record<string, DatosContacto>);
    const enviada = (c: { id: string }) => !!extras[c.id]?.invitacionEnviadaEn;
    const aceptados = contactos.filter((c) => c.status === "accepted").map((c) => primerNombre(c.name));
    const extrasAviso = await adaptadorExtras(supabase).leerAviso(user.id, aviso.id).catch(() => null);
    return (
      <InicioApagado
        t={textosInicio(brand.variant)}
        app={brand.name}
        nombre={primerNombre(profile?.full_name ?? "")}
        aceptados={aceptados}
        apagadoAhora={apagado === "1"}
        plazo={{ fireAt: aviso.fire_at, frecuencia: aviso.recurrence as Frecuencia, dias: extrasAviso?.dias ?? [] }}
        pendientes={contactos.filter((c) => c.status === "pending" && enviada(c)).map((c) => primerNombre(c.name))}
        sinEnviar={contactos.filter((c) => c.status === "pending" && !enviada(c)).map((c) => primerNombre(c.name))}
        vacio={contactos.length === 0}
        rechazados={contactos.filter((c) => c.status === "rejected").map((c) => primerNombre(c.name))}
      />
    );
  }

  // E6: con una alerta en curso, el home pide cancelarla (acción deliberada).
  const { data: enAlerta } = await supabase
    .from("v_my_notice")
    .select("id")
    .eq("state", "alert")
    .limit(1);
  const hayAlerta = (enAlerta?.length ?? 0) > 0;

  // Aviso encendido y sin alerta (E-02 Activo). Alerta y tiempo de gracia siguen en la página de pruebas.
  if (aviso.state === "active" && !hayAlerta && alerta !== "cancelada") {
    const extrasAviso = await adaptadorExtras(supabase).leerAviso(user.id, aviso.id).catch(() => null);
    return (
      <InicioActivo
        t={textosInicio(brand.variant)}
        app={brand.name}
        nombre={primerNombre(profile?.full_name ?? "")}
        encendidoAhora={encendido === "1"}
        plazo={{ fireAt: aviso.fire_at, frecuencia: aviso.recurrence as Frecuencia, dias: extrasAviso?.dias ?? [] }}
      />
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">{brand.name}</h1>
        <p className="text-text-muted">
          Hola{profile?.full_name ? `, ${profile.full_name}` : ""}. El núcleo está funcionando.
        </p>
      </header>

      {hayAlerta && (
        <section
          aria-labelledby="alerta-en-curso"
          className="space-y-3 rounded-lg border-2 border-danger bg-surface p-4"
        >
          <h2 id="alerta-en-curso" className="text-lg font-semibold">
            {textos.alertaTitulo}
          </h2>
          <p className="text-text-muted">{textos.alertaCuerpo}</p>
          <CancelarAlerta textos={textos} />
        </section>
      )}

      {!hayAlerta && alerta === "cancelada" && (
        <section role="status" className="space-y-1 rounded-lg border border-border bg-surface p-4">
          <h2 className="font-medium">{textos.canceladaTitulo}</h2>
          <p className="text-sm text-text-muted">{textos.canceladaCuerpo}</p>
        </section>
      )}

      <section className="space-y-1 rounded-lg bg-surface p-4">
        <h2 className="font-medium">Verificación del núcleo</h2>
        <p className="text-sm text-text-muted">Sesión: {user.email}</p>
        <p className="text-sm text-text-muted">
          Perfil en base de datos: {profile ? "sí" : "no encontrado (revisar migración)"}
        </p>
      </section>

      <TestEmailButton />
      <PushButton />

      <hr className="border-border" />

      <section className="space-y-3">
        <h2 className="font-medium">Probar Aviso</h2>
        <NoticeForm />
      </section>

      <SignOutButton />
    </main>
  );
}
