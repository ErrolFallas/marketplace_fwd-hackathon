import type { NotificacionInput } from '@/lib/notifications/create-logic'
import { DEFAULT_LOCALE } from '@/i18n/config'

/**
 * Construye la notificación in-app para el egresado cuando el empresario
 * responde su entregable (RF-44 / RF-46). Mapea la decisión del empresario al
 * tipo de evento: `aprobado` -> `entregable_aprobado` (con copy distinto si el
 * final cerró el proyecto), `con_cambios` -> `entregable_rechazado` (nombre del
 * enum) con copy "solicitó cambios", nunca "rechazado". Pura.
 */
export function buildEntregableRespuestaNotificacion(input: {
  idUsuarioEgresado: string
  tituloProyecto: string
  idProyecto: string
  decision: 'aprobado' | 'con_cambios'
  finalizado: boolean
}): NotificacionInput {
  const urlDestino = `/${DEFAULT_LOCALE}/egresado/contrataciones/${input.idProyecto}`

  if (input.decision === 'aprobado') {
    const mensaje = input.finalizado
      ? `Tu entregable final del proyecto "${input.tituloProyecto}" fue aprobado. El proyecto está finalizado.`
      : `Tu entregable del proyecto "${input.tituloProyecto}" fue aprobado.`
    return {
      idUsuario: input.idUsuarioEgresado,
      tipoEvento: 'entregable_aprobado',
      params: { titulo: input.tituloProyecto },
      urlDestino,
      mensaje,
    }
  }

  return {
    idUsuario: input.idUsuarioEgresado,
    tipoEvento: 'entregable_rechazado',
    params: { titulo: input.tituloProyecto },
    urlDestino,
    mensaje: `El empresario solicitó cambios en tu entregable de "${input.tituloProyecto}".`,
  }
}
