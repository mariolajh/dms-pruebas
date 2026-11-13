import { createHash } from "node:crypto";
import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { clienteAdmin } from "@/lib/supabase/admin";
import { con, textosInvitacion } from "@/components/invitacion/textos";
import { Pantalla, Tarjeta, clases } from "@/components/emisor/ui";
import { darseDeBaja } from "./actions";

// R1 · Dejar de ser contacto. Un solo paso, sin código. PROVISIONAL (flujo de quien recibe).
export const dynamic = "force-dynamic";

export default async function Baja({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  const brand = getBrand();
  const t = textosInvitacion(brand.variant);
  const admin = clienteAdmin();

  const invalida = (
    <Pantalla>
      <Tarjeta titulo={t.invalida.titulo} id="invalida">
        <p>{t.invalida.texto}</p>
      </Tarjeta>
    </Pantalla>
  );
  if (!token || !admin) return invalida;

  const hash = createHash("sha256").update(token).digest("hex");
  const { data: c } = await admin.from("contacts").select("status, issuer_id").eq("invite_token_hash", hash).maybeSingle();
  if (!c) return invalida;
  const { data: perfil } = await admin.from("profiles").select("full_name").eq("id", c.issuer_id).maybeSingle();
  const v = { quien: perfil?.full_name?.trim() || "esa persona", app: brand.name };

  if (c.status === "removed") {
    return (
      <Pantalla>
        <Tarjeta titulo={con(t.baja.hecho, v)} id="hecho">
          <p>{t.baja.hechoTexto}</p>
        </Tarjeta>
      </Pantalla>
    );
  }

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
          <button type="submit" className={clases.principal}>
            {t.baja.confirmar}
          </button>
          <Link href={`/invitacion?token=${encodeURIComponent(token)}`} className={clases.secundario}>
            {t.baja.volver}
          </Link>
        </form>
      }
    >
      <p className="text-sm font-semibold tracking-wide text-text-muted">{brand.name}</p>
      <h1 className="text-xl font-bold">{con(t.baja.titulo, v)}</h1>
      <p>{con(t.baja.texto, v)}</p>
    </Pantalla>
  );
}
