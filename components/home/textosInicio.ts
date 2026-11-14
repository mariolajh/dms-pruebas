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
  // E-02 Apagado / E-14 Activar aviso (wireflow). "Encender sin diálogo" (nota del flujo).
  apagadoTexto: "No avisaremos a nadie mientras esté apagado.",
  enciendelo: "Enciéndelo para que avisemos a {nombres} si no confirmas.",
  tocaEncender: "Toca para encender tu aviso",
  tocaApagar: "Toca para apagar tu aviso",
  activo: "Activo",
  frecuenciaDiaria: "Todos los días",
  frecuenciaHoy: "Solo hoy",
  regreso: "regreso a las {hora}",
  proximaConfirmacion: "Próxima confirmación",
  ventana: "{dia}, de {desde} a {hasta}",
  estoyBien: "Estoy bien",
  podrasConfirmar: "Podrás confirmar desde las {hora}",
  encendido: "Aviso encendido",
  apagadoListo: "Aviso apagado",
  encendiendo: "Encendiendo tu aviso…",
  apagando: "Apagando tu aviso…",
  unMomento: "Un momento, por favor.",
  noPudimosEncender: "No pudimos encender tu aviso",
  noPudimosApagar: "No pudimos apagar tu aviso",
  revisaConexion: "Revisa tu conexión e inténtalo otra vez.",
  reintentar: "Reintentar",
  // E-12 Apagar aviso: pide confirmar. Para editar, "Apagar y editar" (solo se edita apagado).
  apagarPregunta: "¿Quieres apagar tu aviso?",
  apagarTexto: "Mientras esté apagado no avisaremos a nadie. Puedes encenderlo otra vez cuando quieras.",
  apagarBoton: "Apagar aviso",
  editarDesactivado: "Para editarlo, apaga primero tu aviso.",
  dejarActivo: "Dejarlo activo",
  noSePuedeApagar: "No puedes apagar el aviso mientras esperamos tu confirmación.",
  encender: {
    error: "No pudimos encender tu aviso. Revisa tu conexión e inténtalo otra vez.",
    yaEncendido: "Tu aviso ya está encendido.",
    sinAviso: "Todavía no tienes un aviso. Configúralo primero.",
    sinAceptado: "Todavía nadie aceptó tu invitación. Podrás encenderlo cuando alguien acepte.",
    horaPasada: "La hora de tu aviso ya pasó. Edítalo y elige una hora más tarde.",
  },
  apagar: {
    error: "No pudimos apagar tu aviso. Revisa tu conexión e inténtalo otra vez.",
    enVentana: "No puedes apagar el aviso mientras esperamos tu confirmación.",
    enAlerta: "Tu aviso tiene una alerta en curso. Cancélala con \"Estoy bien, cancelar alerta\".",
  },
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
