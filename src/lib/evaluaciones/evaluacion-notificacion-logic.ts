import type { NotificacionInput } from '@/lib/notifications/create-logic'
import { DEFAULT_LOCALE } from '@/i18n/config'

/**
 * A quién se le notifica una calificación recibida: el egresado (calificado por
 * la empresa) o la empresa (calificada por el egresado). Cada destino tiene su
 * propia pantalla de "mi perfil / mis calificaciones".
 */
export type EvaluacionDestino = 'egresado' | 'empresa'

const URL_POR_DESTINO: Record<EvaluacionDestino, string> = {
  egresado: `/${DEFAULT_LOCALE}/egresado/perfil`,
  empresa: `/${DEFAULT_LOCALE}/empresario/perfil`,
}

/**
 * Construye la notificación in-app para la parte calificada (RF-47 / RF-49).
 * El mismo evento `evaluacion_recibida` sirve en ambos sentidos; solo cambia el
 * destino de la URL (el perfil de quien recibe la reseña). Pura: el productor
 * pasa el destinatario, el título y el destino ya resueltos.
 */
export function buildEvaluacionRecibidaNotificacion(input: {
  idUsuario: string
  tituloProyecto: string
  destino: EvaluacionDestino
}): NotificacionInput {
  return {
    idUsuario: input.idUsuario,
    tipoEvento: 'evaluacion_recibida',
    params: { titulo: input.tituloProyecto },
    urlDestino: URL_POR_DESTINO[input.destino],
    mensaje: `Recibiste una nueva calificación en el proyecto "${input.tituloProyecto}".`,
  }
}
