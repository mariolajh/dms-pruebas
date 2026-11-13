"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { clienteAdmin } from "@/lib/supabase/admin";

// R1 (PRD 12/11) · Dejar de ser contacto con un enlace, sin código, como darse de baja de un boletín.
export async function darseDeBaja(form: FormData) {
  const token = String(form.get("token") ?? "");
  if (!token) redirect("/baja");
  const admin = clienteAdmin();
  if (!admin) redirect(`/baja?token=${encodeURIComponent(token)}&error=1`);
  const hash = createHash("sha256").update(token).digest("hex");
  const { error } = await admin
    .from("contacts")
    .update({ status: "removed", removed_at: new Date().toISOString() })
    .eq("invite_token_hash", hash)
    .neq("status", "removed");
  redirect(`/baja?token=${encodeURIComponent(token)}${error ? "&error=1" : ""}`);
}
