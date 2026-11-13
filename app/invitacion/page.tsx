import { createHash } from "node:crypto";
import { getBrand } from "@/lib/brand";
import { clienteAdmin } from "@/lib/supabase/admin";
import { textosInvitacion } from "@/components/invitacion/textos";
import { Pantalla, Tarjeta, clases } from "@/components/emisor/ui";
import { responderInvitacion } from "./actions";

// R1 · Pantalla que ve quien recibe la invitación (sin cuenta, sin sesión).
// PROVISIONAL: versión de prueba. El diseño definitivo es del flujo de quien recibe.
export const dynamic = "force-dynamic";

export default async function Invitacion({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  const brand = getBrand();
  const t = textosInvitacion(brand.variant);

  const invalida = (
    <Pantalla>
      <Tarjeta titulo={t.invalida.titulo} id="invalida">
        <p>{t.invalida.texto}</p>
      </Tarjeta>
    </Pantalla>
  );
  if (!token) return invalida;

  const admin = clienteAdmin();
  if (!admin) {
    return (
      <Pantalla>
        <Tarjeta>
          <p role="alert">{t.sinConfigurar}</p>
        </Tarjeta>
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

  if (contacto.status === "accepted") {
    return (
      <Pantalla>
        <Tarjeta titulo={t.aceptada.titulo} id="aceptada">
          <p>{t.aceptada.texto(quien)}</p>
          <p className="text-text-muted">{t.aceptada.push}</p>
        </Tarjeta>
      </Pantalla>
    );
  }
  if (contacto.status === "rejected") {
    return (
      <Pantalla>
        <Tarjeta titulo={t.rechazada.titulo} id="rechazada">
          <p>{t.rechazada.texto(quien)}</p>
        </Tarjeta>
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
          <button type="submit" name="decision" value="rejected" className={clases.secundario}>
            {t.rechazar}
          </button>
        </form>
      }
    >
      <p className="text-sm text-text-muted">{brand.name}</p>
      <h1 className="text-xl font-semibold">{t.titulo(quien)}</h1>
      <Tarjeta>
        <p>{t.queEs(brand.name).replace("{quien}", quien)}</p>
        <ul className="list-disc space-y-2 pl-5">
          {t.implica.map((linea) => (
            <li key={linea}>{linea}</li>
          ))}
        </ul>
      </Tarjeta>
    </Pantalla>
  );
}
