import { getBrand } from "@/lib/brand";
import { textosContactos } from "@/components/contactos/textos";
import Dia from "@/components/contactos/Dia";
import Reenviar from "@/components/contactos/Reenviar";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import { textosInicio } from "@/components/home/textosInicio";
import Toast from "@/components/emisor/Toast";
import Quitar from "@/components/contactos/Quitar";
import { EnlaceBoton, Pantalla, Progreso, Tarjeta } from "@/components/emisor/ui";
import { CONFIG_EMISOR } from "@/app/aviso/_datos/config";
import { adaptadorExtras } from "@/app/aviso/_datos/adaptador";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

// R-AV-E1 · Web Aviso · invitación enviada (y lista de contactos fuera del onboarding).
export async function generateMetadata() {
  return { title: textosContactos(getBrand().variant).lista.titulo };
}

export default async function Contactos({
  searchParams,
}: {
  searchParams: Promise<{ enviada?: string; fallo?: string; quitado?: string }>;
}) {
  const { enviada, fallo, quitado } = await searchParams;
  const s = await exigirSesion();
  const t = textosContactos(getBrand().variant).lista;

  const [{ data }, aviso] = await Promise.all([
    s.supabase
      .from("contacts")
      .select("id, name, status, created_at, accepted_at")
      .eq("issuer_id", s.user.id)
      .neq("status", "removed")
      .order("position"),
    avisoActual(s),
  ]);
  const contactos = data ?? [];
  const extras = await adaptadorExtras(s.supabase)
    .leerContactos(s.user.id, contactos.map((c) => c.id))
    .catch(() => ({}) as Record<string, DatosContacto>);
  const enAlta = !aviso;
  const puedeAgregar = contactos.length < CONFIG_EMISOR.contactosMax;
  const hayAceptado = contactos.some((c) => c.status === "accepted");
  // Para continuar el alta hace falta alguien a quien poder avisar (no vale solo quien rechazó).
  const hayUtiles = contactos.some((c) => c.status === "pending" || c.status === "accepted");

  // En el alta (flujo de pasos): botones fijos abajo, sin menú. Fuera del alta: menú principal
  // y "Agregar" dentro de la página (norma de la biblioteca, Barra de navegación).
  const pieAlta =
    enAlta && (puedeAgregar || hayUtiles) ? (
      <>
        {puedeAgregar && (
          <EnlaceBoton href="/contactos/nuevo" tipo={hayUtiles ? "secundario" : "principal"}>
            {t.agregar}
          </EnlaceBoton>
        )}
        {hayUtiles && <EnlaceBoton href="/aviso">{t.continuar}</EnlaceBoton>}
      </>
    ) : undefined;

  return (
    <Pantalla pie={pieAlta} nav={enAlta ? undefined : <BarraNavegacion t={textosInicio(getBrand().variant).nav} actual="contactos" />}>
      {enAlta ? <Progreso actual={2} total={3} siguiente={t.siguiente} /> : <h1 className="pt-2 text-2xl font-semibold">{t.titulo}</h1>}

      {enviada && <Toast texto={t.enviada} quitarParametro="enviada" />}
      {quitado && <Toast texto={t.quitado} quitarParametro="quitado" />}
      {fallo && (
        <p role="alert" className="rounded-lg border-2 border-danger bg-surface p-3 text-sm font-medium">
          {t.falloCorreo}
        </p>
      )}

      <Tarjeta titulo={enAlta ? t.titulo : undefined} id="tus-contactos">
        <p className="text-text-muted">{hayAceptado ? t.textoAceptado : t.texto}</p>
        {contactos.length === 0 && <p>{t.vacio}</p>}
        {/* Sin números: el orden de aviso se decide en "Configura tu aviso", no aquí. */}
        <ul className="space-y-3">
          {contactos.map((c) => {
            const enviadaEn = extras[c.id]?.invitacionEnviadaEn;
            return (
              <li key={c.id} className="space-y-1 rounded-lg border border-border/50 p-3">
                <p className="font-semibold">{c.name}</p>
                {extras[c.id]?.relacion && <p className="text-sm text-text-muted">{extras[c.id]?.relacion}</p>}
                {/* Un solo estado por contacto: sin enviar, esperando, aceptó o rechazó. */}
                {c.status === "pending" && !enviadaEn && <p className="text-sm font-medium text-danger">{t.noEnviada}</p>}
                {c.status === "pending" && enviadaEn && (
                  <>
                    <p className="text-sm font-medium">{t.pendiente}</p>
                    <p className="text-sm text-text-muted">
                      <Dia iso={enviadaEn} prefijo={t.enviadaEl} />
                    </p>
                  </>
                )}
                {c.status === "accepted" && (
                  <p className="text-sm font-medium">
                    <Dia iso={c.accepted_at ?? c.created_at} prefijo={t.aceptoEl} />
                  </p>
                )}
                {c.status === "rejected" && <p className="text-sm font-medium">{t.rechazo}</p>}
                <div className="flex flex-wrap items-start gap-x-6">
                  {c.status === "pending" && <Reenviar contactId={c.id} nombre={c.name} sinEnviar={!enviadaEn} t={t} />}
                  <Quitar contactId={c.id} nombre={c.name} estado={c.status as "pending" | "accepted" | "rejected"} t={t} />
                </div>
              </li>
            );
          })}
        </ul>
      </Tarjeta>
      {!enAlta && puedeAgregar && (
        <EnlaceBoton href="/contactos/nuevo" tipo="secundario">
          {t.agregar}
        </EnlaceBoton>
      )}
    </Pantalla>
  );
}
