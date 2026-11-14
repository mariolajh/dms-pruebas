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
  const brand = getBrand();
  return <Comienzo t={textosAlta(brand.variant).comienzo} app={brand.name} />;
}
