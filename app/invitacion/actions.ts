"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { clienteAdmin } from "@/lib/supabase/admin";

// R1 · Quien recibe la invitación acepta o rechaza desde el enlace, sin cuenta.
// El token llega en claro; en base de datos solo está su hash.

export async function responderInvitacion(form: FormData) {
  const token = String(form.get("token") ?? "");
  const decision = String(form.get("decision") ?? "");
  if (!token || (decision !== "accepted" && decision !== "rejected")) redirect("/invitacion");

  const admin = clienteAdmin();
  if (!admin) redirect(`/invitacion?token=${encodeURIComponent(token)}&error=1`);

  const hash = createHash("sha256").update(token).digest("hex");
  // Solo cambia si sigue pendiente: un doble clic o un enlace viejo no pisan una respuesta.
  const { error } = await admin
    .from("contacts")
    .update({
      status: decision,
      accepted_at: decision === "accepted" ? new Date().toISOString() : null,
    })
    .eq("invite_token_hash", hash)
    .eq("status", "pending");

  redirect(`/invitacion?token=${encodeURIComponent(token)}${error ? "&error=1" : ""}`);
}
