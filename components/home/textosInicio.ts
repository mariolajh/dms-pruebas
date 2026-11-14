import type { Variant } from "@/lib/brand";

// Textos del Inicio de quien emite con el aviso apagado (E · Inicio · Esperando contactos).
// Un bloque por versión (AGENTS.md sección 5). Marcadores: {nombre}, {nombres}.

const COMUNES = {
  hola: "Hola, {nombre}",
  holaSinNombre: "Hola",
  esperando: "Esperando contactos",
  apagado: "Apagado",
  editar: "Editar",
  editarAria: "Editar tu aviso",
  tuAviso: "Tu aviso",
  podras: "Podrás encender tu aviso cuando al menos un contacto acepte.",
  aunNoUno: "{nombres} aún no responde.",
  aunNoVarios: "{nombres} aún no responden.",
  noEnviadaUno: "La invitación de {nombres} no se envió. Envíala desde Contactos.",
  noEnviadaVarios: "Las invitaciones de {nombres} no se enviaron. Envíalas desde Contactos.",
  avisoSinContactos: "Tu aviso no tiene contactos. Edítalo para añadir al menos uno.",
  rechazoUno: "{nombres} rechazó la invitación.",
  rechazoVarios: "{nombres} rechazaron la invitación.",
  verContactos: "Ver contactos",
  titulo: "Inicio",
  historial: { titulo: "Historial", vacio: "Aquí verás tus confirmaciones y alertas. Esta pantalla todavía no está disponible." },
  ajustes: { titulo: "Ajustes", cuenta: "Tu cuenta", notificaciones: "Notificaciones", activar: "Activar en este dispositivo", pronto: "El resto de ajustes llegará pronto." },
  nav: { inicio: "Inicio", contactos: "Contactos", historial: "Historial", ajustes: "Ajustes" },
};

export type TextosInicio = typeof COMUNES;

const POR_VERSION: Record<Variant, TextosInicio> = {
  cerca: COMUNES,
  montana: COMUNES,
};

export function textosInicio(variant: Variant): TextosInicio {
  return POR_VERSION[variant];
}
