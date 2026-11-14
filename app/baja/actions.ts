"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { clienteAdmin } from "@/lib/supabase/admin";
import { sacarDeAvisos } from "@/app/contactos/_baja";

// R1 (PRD 12/11) · Dejar de ser contacto con un enlace, sin código, como darse de baja de un boletín.
export async function darseDeBaja(form: FormData) {
  const token = String(form.get("token") ?? "");
  if (!token) redirect("/baja");
  const destino = `/baja?token=${encodeURIComponent(token)}`;
  const admin = clienteAdmin();
  if (!admin) redirect(`${destino}&error=1`);
  const hash = createHash("sha256").update(token).digest("hex");

  const { data: c } = await admin.from("contacts").select("id, issuer_id, status").eq("invite_token_hash", hash).maybeSingle();
  if (!c) redirect("/baja");
  if (c.status !== "removed") {
    const { error } = await admin.from("contacts").update({ status: "removed", removed_at: new Date().toISOString() }).eq("id", c.id);
    if (error) redirect(`${destino}&error=1`);
    // Sale del aviso; si era el último contacto aceptado de un aviso encendido, el aviso se apaga solo.
    await sacarDeAvisos(admin, c.issuer_id as string, c.id as string);
  }
  redirect(destino);
}
