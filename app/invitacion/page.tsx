import { createHash } from "node:crypto";
import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { clienteAdmin } from "@/lib/supabase/admin";
import { con, textosInvitacion } from "@/components/invitacion/textos";
import { Pantalla, clases } from "@/components/emisor/ui";
import { primerNombre } from "@/app/aviso/_datos/formato";
import { responderInvitacion } from "./actions";

// R1 · Pantalla que ve quien recibe la invitación (sin cuenta, sin sesión, sin menú).
// PROVISIONAL: versión de prueba. El diseño definitivo es del flujo de quien recibe.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: textosInvitacion(getBrand().variant).pestana, robots: { index: false } };
}

function Marca({ nombre }: { nombre: string }) {
  return <p className="pt-2 text-sm font-semibold tracking-wide text-text-muted">{nombre}</p>;
}

// Pantalla de un solo mensaje (enlace caducado, ya aceptada, ya rechazada).
function Mensaje({ marca, titulo, children }: { marca: string; titulo: string; children: React.ReactNode }) {
  return (
    <Pantalla>
      <Marca nombre={marca} />
      <section className="space-y-3 rounded-xl bg-surface p-4">
        <h1 className="text-xl font-bold">{titulo}</h1>
        {children}
      </section>
    </Pantalla>
  );
}

function Lista({ titulo, lineas, tipo }: { titulo: string; lineas: string[]; tipo: "si" | "no" }) {
  return (
    <section className="space-y-3 rounded-xl bg-surface p-4">
      <h2 className="text-lg font-bold">{titulo}</h2>
      <ul className="space-y-3">
        {lineas.map((l) => (
          <li key={l} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full ${tipo === "si" ? "bg-success text-brand-on-primary" : "border border-border bg-surface-muted text-text"}`}
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {tipo === "si" ? <path d="M5 12l5 5 9-10" /> : <path d="M6 12h12" />}
              </svg>
            </span>
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function Invitacion({ searchParams }: { searchParams: Promise<{ token?: string; error?: string; rechazar?: string }> }) {
  const { token, error, rechazar } = await searchParams;
  const brand = getBrand();
  const t = textosInvitacion(brand.variant);

  const invalida = (
    <Mensaje marca={brand.name} titulo={t.invalida.titulo}>
      <p>{t.invalida.texto}</p>
    </Mensaje>
  );
  if (!token) return invalida;

  const admin = clienteAdmin();
  if (!admin) {
    return (
      <Pantalla>
        <p role="alert" className="rounded-xl bg-surface p-4">
          {t.sinConfigurar}
        </p>
      </Pantalla>
    );
  }

  const hash = createHash("sha256").update(token).digest("hex");
  const { data: contacto } = await admin
    .from("contacts")
    .select("name, status, issuer_id")
    .eq("invite_token_hash", hash)
    .maybeSingle();
  if (!contacto || contacto.status === "removed") return invalida;

  const { data: perfil } = await admin.from("profiles").select("full_name").eq("id", contacto.issuer_id).maybeSingle();
  const quien = perfil?.full_name?.trim() || "Una persona";
  const v = { quien, nombre: primerNombre(quien), app: brand.name };
  const enlace = `/invitacion?token=${encodeURIComponent(token)}`;

  if (contacto.status === "accepted") {
    return (
      <Mensaje marca={brand.name} titulo={con(t.aceptada.titulo, v)}>
        <p>{t.aceptada.texto}</p>
        <Link href={`/baja?token=${encodeURIComponent(token)}`} className={clases.enlace}>
          {t.aceptada.baja}
        </Link>
      </Mensaje>
    );
  }
  if (contacto.status === "rejected") {
    return (
      <Mensaje marca={brand.name} titulo={t.rechazada.titulo}>
        <p>{con(t.rechazada.texto, v)}</p>
      </Mensaje>
    );
  }

  // Rechazar no se deshace: se confirma en una pantalla aparte antes de guardar nada.
  if (rechazar) {
    return (
      <Pantalla
        pie={
          <form action={responderInvitacion} className="space-y-2">
            <input type="hidden" name="token" value={token} />
            <button type="submit" name="decision" value="rejected" className={clases.principal}>
              {t.confirmarRechazo.si}
            </button>
            <Link href={enlace} className={clases.secundario}>
              {t.confirmarRechazo.no}
            </Link>
          </form>
        }
      >
        <Marca nombre={brand.name} />
        <h1 className="text-xl font-bold">{con(t.confirmarRechazo.titulo, v)}</h1>
        <p>{con(t.confirmarRechazo.texto, v)}</p>
      </Pantalla>
    );
  }

  return (
    <Pantalla
      pie={
        <form action={responderInvitacion} className="space-y-2">
          <input type="hidden" name="token" value={token} />
          {error && (
            <p role="alert" className={clases.error}>
              {t.fallo}
            </p>
          )}
          <button type="submit" name="decision" value="accepted" className={clases.principal}>
            {t.aceptar}
          </button>
          <Link href={`${enlace}&rechazar=1`} className={clases.secundario}>
            {t.rechazar}
          </Link>
          <p className="pt-1 text-center text-sm text-text-muted">{t.pie}</p>
        </form>
      }
    >
      <Marca nombre={brand.name} />
      <div className="space-y-3">
        <p className="text-sm font-medium text-text-muted">{t.de}</p>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xl font-bold text-brand-on-primary">
            {quien[0]?.toUpperCase()}
          </span>
          <h1 className="text-xl font-bold leading-snug">{con(t.titulo, v)}</h1>
        </div>
        <p>{con(t.intro, v)}</p>
      </div>
      <Lista titulo={t.esTitulo} lineas={t.es.map((l) => con(l, v))} tipo="si" />
      <Lista titulo={t.noEsTitulo} lineas={t.noEs.map((l) => con(l, v))} tipo="no" />
    </Pantalla>
  );
}
