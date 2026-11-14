import { notFound } from "next/navigation";
import { getBrand } from "@/lib/brand";
import { CONFIG_EMISOR, configVersion } from "@/app/aviso/_datos/config";
import type { DatosContacto } from "@/app/aviso/_datos/tipos";
import { textosAlta } from "@/components/alta/textos";
import Comienzo from "@/components/alta/Comienzo";
import ActivarNotificaciones from "@/components/alta/ActivarNotificaciones";
import { textosAviso } from "@/components/aviso/textos";
import ConfigurarAviso, { type ContactoOpcion, type Paso } from "@/components/aviso/ConfigurarAviso";
import { textosContactos } from "@/components/contactos/textos";
import FormContacto from "@/components/contactos/FormContacto";
import ListaContactos, { type ContactoFila } from "@/components/contactos/ListaContactos";
import { textosInicio } from "@/components/home/textosInicio";
import InicioDeMuestra from "@/components/muestra/InicioDeMuestra";
import Marco from "@/components/muestra/Marco";
import { PANTALLAS } from "../pantallas";

// /muestra/<pantalla>: una pantalla real del flujo de quien emite con datos de ejemplo.
// No lee la base ni pide sesión. Mariana emite, Ana y Luis son sus contactos.
export function generateStaticParams() {
  return PANTALLAS.map((p) => ({ pantalla: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ pantalla: string }> }) {
  const { pantalla } = await params;
  const p = PANTALLAS.find((x) => x.id === pantalla);
  return { title: p ? `Muestra · ${p.titulo}` : "Muestra", robots: { index: false, follow: false } };
}

const HACE_DOS_DIAS = new Date(Date.now() - 2 * 86_400_000).toISOString();
const ENVIADA: DatosContacto = { relacion: null, invitacionEnviadaEn: HACE_DOS_DIAS };
const fila = (id: string, name: string, status: string): ContactoFila => ({ id, name, status, created_at: HACE_DOS_DIAS });
const ANA = (status: string) => fila("ana", "Ana Ruiz", status);
const LUIS = (status: string) => fila("luis", "Luis Mora", status);
const EXTRAS: Record<string, DatosContacto> = { ana: { ...ENVIADA, relacion: "Hermana" }, luis: { ...ENVIADA, relacion: "Amigo" } };

export default async function PantallaDeMuestra({ params }: { params: Promise<{ pantalla: string }> }) {
  const { pantalla } = await params;
  const i = PANTALLAS.findIndex((p) => p.id === pantalla);
  if (i < 0) notFound();

  const marca = getBrand();
  const tInicio = textosInicio(marca.variant);
  const tContactos = textosContactos(marca.variant);

  const lista = (contactos: ContactoFila[], enAlta = false) => (
    <ListaContactos
      t={tContactos.lista}
      nav={tInicio.nav}
      app={marca.name}
      contactos={contactos}
      extras={EXTRAS}
      enAlta={enAlta}
      maximo={CONFIG_EMISOR.contactosMax}
    />
  );

  const opciones: ContactoOpcion[] = [
    { id: "ana", name: "Ana Ruiz", accepted: true, enviada: true, relacion: "Hermana" },
    { id: "luis", name: "Luis Mora", accepted: false, enviada: true, relacion: "Amigo" },
  ];
  const aviso = (pasoInicial: Paso, enAlta = false) => (
    <ConfigurarAviso
      t={textosAviso(marca.variant)}
      inicial={{
        fireAt: null,
        horaPorDefecto: configVersion(marca.variant).horaPorDefecto,
        frecuencia: "daily",
        dias: [],
        graciaMin: configVersion(marca.variant).graciaPorDefecto,
        mensaje: "",
        contactos: ["ana", "luis"],
      }}
      opciones={opciones}
      limites={{
        graciaOpciones: CONFIG_EMISOR.gracia.opciones,
        graciaMin: CONFIG_EMISOR.gracia.minimoMin,
        graciaMax: CONFIG_EMISOR.gracia.maximoMin,
        mensajeMax: CONFIG_EMISOR.mensajeMax,
      }}
      volverHref="/muestra"
      enAlta={enAlta}
      pasoInicial={pasoInicial}
    />
  );

  const vistas: Record<string, () => React.ReactNode> = {
    "alta-comienzo": () => <Comienzo t={textosAlta(marca.variant).comienzo} app={marca.name} />,
    "alta-notificaciones": () => <ActivarNotificaciones t={textosAlta(marca.variant).notificaciones} enAlta />,
    "alta-primer-contacto": () => <FormContacto t={tContactos.nuevo} enAlta esPrimero cancelarHref="/muestra" />,
    "alta-contactos": () => lista([ANA("pending")], true),
    "alta-aviso": () => aviso("hora", true),
    "agregar-contacto": () => <FormContacto t={tContactos.nuevo} enAlta={false} esPrimero={false} cancelarHref="/muestra" />,
    "contactos-en-espera": () => lista([ANA("pending")]),
    "contactos-acepto": () => lista([ANA("accepted"), LUIS("pending")]),
    "contactos-no-acepto": () => lista([ANA("rejected")]),
    "inicio-esperando": () => <InicioDeMuestra t={tInicio} app={marca.name} estado="esperando" />,
    "inicio-apagado": () => <InicioDeMuestra t={tInicio} app={marca.name} estado="apagado" />,
    "inicio-activo": () => <InicioDeMuestra t={tInicio} app={marca.name} estado="activo" />,
    "aviso-hora": () => aviso("hora"),
    "aviso-contactos": () => aviso("contactos"),
    "aviso-resumen": () => aviso("resumen"),
  };
  const vista = vistas[pantalla];
  if (!vista) notFound();

  return (
    <Marco titulo={PANTALLAS[i].titulo} anterior={PANTALLAS[i - 1]?.id} siguiente={PANTALLAS[i + 1]?.id}>
      {vista()}
    </Marco>
  );
}
