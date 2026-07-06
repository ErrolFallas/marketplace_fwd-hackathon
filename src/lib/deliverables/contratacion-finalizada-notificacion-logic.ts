import type { NotificacionInput } from '@/lib/notifications/create-logic'
import { DEFAULT_LOCALE } from '@/i18n/config'

/**
 * Notificación in-app para el egresado cuando el empresario finaliza la
 * contratación (RF-47). El proyecto quedó finalizado y ya puede calificar a la
 * empresa; el enlace lleva a su zona de la contratación, donde aparece la card de
 * calificar. Pura: el productor pasa el destinatario y el título ya resueltos.
 */
export function buildContratacionFinalizadaNotificacion(input: {
  idUsuarioEgresado: string
  tituloProyecto: string
  idProyecto: string
}): NotificacionInput {
  return {
    idUsuario: input.idUsuarioEgresado,
    tipoEvento: 'contratacion_finalizada',
    params: { titulo: input.tituloProyecto },
    urlDestino: `/${DEFAULT_LOCALE}/egresado/contrataciones/${input.idProyecto}`,
    mensaje: `El proyecto "${input.tituloProyecto}" se finalizó. Ya podés calificar a la empresa.`,
  }
}
