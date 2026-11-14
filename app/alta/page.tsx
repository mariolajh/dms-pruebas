import { getBrand } from "@/lib/brand";
import { textosAlta } from "@/components/alta/textos";
import Comienzo from "@/components/alta/Comienzo";
import { redirect } from "next/navigation";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

// R-AV-E1 · Web · Onboarding · comienzo
export async function generateMetadata() {
  return { title: textosAlta(getBrand().variant).comienzo.empezar };
}

export default async function AltaComienzo() {
  const s = await exigirSesion();
  // La bienvenida es solo para quien todavía no tiene aviso.
  if (await avisoActual(s)) redirect("/home");
  // Si cierra la app a medias, retoma donde iba (el progreso está en lo que ya se guardó):
  // con contactos invitados va al paso 2 (lista con "Continuar"); con notificaciones activas, a agregar contacto.
  const [{ count: contactos }, { count: dispositivos }] = await Promise.all([
    s.supabase.from("contacts").select("id", { count: "exact", head: true }).eq("issuer_id", s.user.id).in("status", ["pending", "accepted"]),
    s.supabase.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("issuer_id", s.user.id),
  ]);
  if ((contactos ?? 0) > 0) redirect("/contactos");
  if ((dispositivos ?? 0) > 0) redirect("/contactos/nuevo");
  const brand = getBrand();
  return <Comienzo t={textosAlta(brand.variant).comienzo} app={brand.name} />;
}
