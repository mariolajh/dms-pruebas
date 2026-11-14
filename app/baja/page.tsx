import { createHash } from "node:crypto";
import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { clienteAdmin } from "@/lib/supabase/admin";
import { con, textosInvitacion } from "@/components/invitacion/textos";
import { Pantalla, clases } from "@/components/emisor/ui";
import BotonEnvio from "@/components/emisor/BotonEnvio";
import { primerNombre } from "@/app/aviso/_datos/formato";
import { darseDeBaja } from "./actions";

// R1 · Dejar de ser contacto. Un solo paso, sin código. PROVISIONAL (flujo de quien recibe).
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: textosInvitacion(getBrand().variant).baja.pestana, robots: { index: false } };
}

function Mensaje({ marca, titulo, children }: { marca: string; titulo: string; children: React.ReactNode }) {
  return (
    <Pantalla>
      <p className="pt-2 text-sm font-semibold tracking-wide text-text-muted">{marca}</p>
      <section className="space-y-3 rounded-xl bg-surface p-4">
        <h1 className="text-xl font-bold">{titulo}</h1>
        {children}
      </section>
    </Pantalla>
  );
}

export default async function Baja({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  const brand = getBrand();
  const t = textosInvitacion(brand.variant);
  const admin = clienteAdmin();

  const invalida = (
    <Mensaje marca={brand.name} titulo={t.invalida.titulo}>
      <p>{t.invalida.texto}</p>
    </Mensaje>
  );
  if (!token || !admin) return invalida;

  const hash = createHash("sha256").update(token).digest("hex");
  const { data: c } = await admin.from("contacts").select("status, issuer_id").eq("invite_token_hash", hash).maybeSingle();
  if (!c) return invalida;
  const { data: perfil } = await admin.from("profiles").select("full_name").eq("id", c.issuer_id).maybeSingle();
  const v = { nombre: primerNombre(perfil?.full_name?.trim() || "") || "esa persona", app: brand.name };

  if (c.status === "removed") {
    return (
      <Mensaje marca={brand.name} titulo={con(t.baja.hecho, v)}>
        <p>{t.baja.hechoTexto}</p>
      </Mensaje>
    );
  }
  // Solo quien aceptó es contacto. Si está pendiente o rechazó, no hay nada que dejar.
  if (c.status !== "accepted") return invalida;

  return (
    <Pantalla
      pie={
        <form action={darseDeBaja} className="space-y-2">
          <input type="hidden" name="token" value={token} />
          {error && (
            <p role="alert" className={clases.error}>
              {t.fallo}
            </p>
          )}
          <BotonEnvio className={clases.principal} pendiente={t.baja.pendiente}>
            {t.baja.confirmar}
          </BotonEnvio>
          <Link href={`/invitacion?token=${encodeURIComponent(token)}`} className={clases.secundario}>
            {t.baja.volver}
          </Link>
        </form>
      }
    >
      <p className="pt-2 text-sm font-semibold tracking-wide text-text-muted">{brand.name}</p>
      <h1 className="text-xl font-bold">{con(t.baja.titulo, v)}</h1>
      <p>{con(t.baja.texto, v)}</p>
    </Pantalla>
  );
}
