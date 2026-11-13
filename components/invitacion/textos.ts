import type { Variant } from "@/lib/brand";

// R1 · Invitación vista por quien la recibe. PROVISIONAL, para probar el recorrido completo.
// El texto definitivo es del flujo de quien recibe. Tuteo neutro; sin "emergencia", "peligro" ni "muerte".

const COMUNES = {
  titulo: (quien: string) => `${quien} te eligió como contacto de confianza`,
  queEs: (app: string) =>
    `En ${app}, ${"{quien}"} confirma cada cierto tiempo que está bien. Si un día no lo hace, te avisamos a ti para que puedas comunicarte con esa persona.`,
  implica: [
    "No pasa nada mientras esa persona esté bien: no recibirás mensajes.",
    "Si hace falta, te llega un aviso por correo con lo que puedes hacer.",
    "No tienes que instalar nada ni crear una cuenta.",
    "Puedes dejar de ser su contacto cuando quieras, desde un enlace al pie de cada correo.",
  ],
  aceptar: "Aceptar",
  rechazar: "No, gracias",
  aceptada: {
    titulo: "Listo, ya eres su contacto",
    texto: (quien: string) => `Le avisamos a ${quien}. Si algún día hace falta, te escribiremos a este correo.`,
    push: "Por ahora te avisaremos por correo.",
  },
  rechazada: {
    titulo: "Has rechazado la invitación",
    texto: (quien: string) => `Le avisamos a ${quien}. No recibirás nada más.`,
  },
  yaAceptada: "Ya aceptaste esta invitación. No tienes que hacer nada más.",
  yaRechazada: "Ya rechazaste esta invitación.",
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
