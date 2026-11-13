import { getBrand } from "@/lib/brand";
import { textosInicio } from "@/components/home/textosInicio";
import BarraNavegacion from "@/components/home/BarraNavegacion";
import { Pantalla, Tarjeta } from "@/components/emisor/ui";
import { exigirSesion } from "@/app/aviso/_datos/sesion";

// PROVISIONAL: el Historial (E7) es de otro flujo. Esta página solo evita el 404 del menú.
export async function generateMetadata() {
  return { title: textosInicio(getBrand().variant).historial.titulo };
}

export default async function Historial() {
  await exigirSesion();
  const t = textosInicio(getBrand().variant);
  return (
    <Pantalla nav={<BarraNavegacion t={t.nav} actual="historial" />}>
      <h1 className="pt-2 text-2xl font-semibold">{t.historial.titulo}</h1>
      <Tarjeta>
        <p className="text-text-muted">{t.historial.vacio}</p>
      </Tarjeta>
    </Pantalla>
  );
}
