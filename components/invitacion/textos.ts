import type { Variant } from "@/lib/brand";

// R1 · Invitación vista por quien la recibe. PROVISIONAL, para probar el recorrido completo.
// El texto y el diseño definitivos son del flujo de quien recibe (Luna).
// PRD 12/11: dice con claridad quién invita y explica qué es y qué no es ser contacto.
// Tuteo neutro; sin "emergencia", "peligro" ni "muerte".

const COMUNES = {
  de: "Invitación de",
  titulo: "{quien} te invita a ser su contacto de confianza",
  intro: "{quien} usa {app} para confirmar cada cierto tiempo que está bien. Si un día no lo hace, te avisamos a ti.",
  esTitulo: "Qué es ser contacto",
  es: [
    "Recibes un aviso por correo solo si {quien} no confirma a tiempo.",
    "Puedes escribirle o llamarle para saber cómo está.",
    "Puedes dejar de serlo cuando quieras.",
  ],
  noEsTitulo: "Qué no es",
  noEs: [
    "No recibes nada mientras {quien} esté bien.",
    "No ves sus datos ni dónde está.",
    "No tienes que instalar nada ni crear una cuenta.",
  ],
  aceptar: "Aceptar",
  rechazar: "No, gracias",
  pie: "Puedes decidir ahora o más tarde: no pasa nada si no respondes.",
  aceptada: {
    titulo: "Listo, ya eres su contacto",
    texto: "Le avisamos a {quien}. Si algún día hace falta, te escribiremos a este correo.",
    push: "Por ahora te avisaremos por correo.",
    baja: "Dejar de ser su contacto",
  },
  rechazada: {
    titulo: "Has rechazado la invitación",
    texto: "Le avisamos a {quien}. No recibirás nada más.",
  },
  yaAceptada: "Ya aceptaste esta invitación. No tienes que hacer nada más.",
  yaRechazada: "Ya rechazaste esta invitación.",
  baja: {
    titulo: "¿Dejar de ser contacto de {quien}?",
    texto: "No recibirás más avisos suyos. {quien} se entera y puede invitarte de nuevo si quiere.",
    confirmar: "Dejar de ser contacto",
    volver: "Mantenerme como contacto",
    hecho: "Ya no eres contacto de {quien}",
    hechoTexto: "No recibirás más avisos suyos.",
  },
  invalida: {
    titulo: "Este enlace ya no vale",
    texto: "Puede que la persona te haya enviado una invitación nueva. Busca el correo más reciente.",
  },
  fallo: "No pudimos guardar tu respuesta. Inténtalo de nuevo.",
  sinConfigurar: "Falta configurar el servidor para recibir invitaciones.",
};

export type TextosInvitacion = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosInvitacion> = {
  cerca: COMUNES,
  montana: COMUNES,
};

export function textosInvitacion(variant: Variant): TextosInvitacion {
  return POR_VERSION[variant];
}

export function con(plantilla: string, valores: Record<string, string>) {
  return plantilla.replace(/\{(\w+)\}/g, (_, k: string) => valores[k] ?? "");
}
