import type { Variant } from "@/lib/brand";

// R1 · Invitación vista por quien la recibe. PROVISIONAL, para probar el recorrido completo.
// El texto y el diseño definitivos son del flujo de quien recibe (Luna).
// PRD 12/11: dice con claridad quién invita y explica qué es y qué no es ser contacto.
// Tuteo neutro; sin "emergencia", "peligro" ni "muerte".
// Marcadores: {quien} = nombre completo (solo en el título), {nombre} = primer nombre, {app}.

const COMUNES = {
  pestana: "Invitación",
  de: "Invitación de",
  titulo: "{quien} te invita a ser su contacto de confianza",
  intro: "{nombre} usa {app} para confirmar cada cierto tiempo que está bien. Si un día no lo hace, te avisamos a ti.",
  esTitulo: "Qué es ser contacto",
  es: [
    // Sin "solo": también llegan esta invitación y el aviso de que todo se resolvió.
    "Te avisamos por correo si {nombre} no confirma a tiempo.",
    // R4: la alerta trae botones para llamar y escribir a quien emite.
    "Puedes llamarle o escribirle para saber cómo está.",
    "Puedes dejar de serlo cuando quieras.",
  ],
  noEsTitulo: "Qué no es",
  noEs: [
    "No recibes avisos mientras {nombre} esté bien.",
    // PENDIENTE DE CONFIRMAR con el equipo: deducido de "nada compartido por defecto".
    "No ves sus datos ni dónde está.",
    "No tienes que instalar nada ni crear una cuenta.",
  ],
  aceptar: "Aceptar",
  rechazar: "No, gracias",
  pie: "Puedes responder más tarde con este mismo enlace.",
  confirmarRechazo: {
    titulo: "¿Rechazar la invitación de {nombre}?",
    texto: "No te avisaremos si {nombre} no confirma. {nombre} verá que la rechazaste.",
    si: "Sí, rechazar",
    no: "Volver a la invitación",
  },
  aceptada: {
    titulo: "Listo, ya eres contacto de {nombre}",
    texto: "Si algún día hace falta, te escribiremos a este correo.",
    baja: "Dejar de ser su contacto",
  },
  rechazada: {
    titulo: "Rechazaste la invitación",
    texto: "No recibirás avisos de {nombre}.",
  },
  baja: {
    pestana: "Dejar de ser contacto",
    titulo: "¿Dejar de ser contacto de {nombre}?",
    texto: "No recibirás más avisos suyos. {nombre} puede invitarte de nuevo si quiere.",
    confirmar: "Dejar de ser contacto",
    volver: "Seguir siendo su contacto",
    hecho: "Ya no eres contacto de {nombre}",
    hechoTexto: "No recibirás más avisos suyos.",
  },
  invalida: {
    titulo: "Este enlace ya no vale",
    texto: "Este enlace ya no está activo. Si tienes un correo más reciente, usa ese enlace.",
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
