import { getBrand } from "@/lib/brand";
import { textosInicio } from "@/components/home/textosInicio";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import SignOutButton from "@/components/auth/SignOutButton";
import { EnlaceBoton, Pantalla, Tarjeta } from "@/components/emisor/ui";
import { exigirSesion } from "@/app/aviso/_datos/sesion";

// PROVISIONAL: Ajustes y cuenta (E8) son de otro flujo. Esta página evita el 404 del menú
// y da lo mínimo: ver con qué cuenta estás, cerrar sesión y activar las notificaciones.
export async function generateMetadata() {
  return { title: textosInicio(getBrand().variant).ajustes.titulo };
}

export default async function Ajustes() {
  const s = await exigirSesion();
  const t = textosInicio(getBrand().variant);
  return (
    <Pantalla nav={<BarraNavegacion t={t.nav} actual="ajustes" />}>
      <h1 className="pt-2 text-2xl font-semibold">{t.ajustes.titulo}</h1>
      <Tarjeta titulo={t.ajustes.cuenta} id="ajustes-cuenta">
        <p className="break-all text-text-muted">{s.user.email}</p>
        <SignOutButton />
      </Tarjeta>
      <Tarjeta titulo={t.ajustes.notificaciones} id="ajustes-notificaciones">
        <EnlaceBoton href="/alta/notificaciones" tipo="secundario">
          {t.ajustes.activar}
        </EnlaceBoton>
      </Tarjeta>
      <p className="text-sm text-text-muted">{t.ajustes.pronto}</p>
    </Pantalla>
  );
}
