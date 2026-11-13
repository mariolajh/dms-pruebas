import { getBrand } from "@/lib/brand";
import { textosAlta } from "@/components/alta/textos";
import ActivarNotificaciones from "@/components/alta/ActivarNotificaciones";
import { avisoActual, exigirSesion } from "@/app/aviso/_datos/sesion";

// R-AV-E1 · Web · Onboarding · activar notificaciones / notificaciones activas / no activó
export async function generateMetadata() {
  return { title: textosAlta(getBrand().variant).notificaciones.titulo };
}

export default async function AltaNotificaciones() {
  const s = await exigirSesion();
  const t = textosAlta(getBrand().variant).notificaciones;
  return <ActivarNotificaciones t={t} enAlta={!(await avisoActual(s))} />;
}
