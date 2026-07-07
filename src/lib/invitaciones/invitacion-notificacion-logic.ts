import type { NotificacionInput } from '@/lib/notifications/create-logic'
import { DEFAULT_LOCALE } from '@/i18n/config'

/**
 * Construye la notificación in-app de "un empresario te invitó a postular en su
 * proyecto". Pura: el productor pasa el destinatario y el proyecto ya resueltos.
 *
 * - `urlDestino` apunta al detalle PÚBLICO del proyecto (vista del egresado),
 *   donde puede leer la propuesta y postular formalmente. La invitación NO lo
 *   inscribe: el copy i18n (`content.invitacion_proyecto`) lo deja explícito.
 * - `params.idProyecto` se guarda además del `titulo` para poder detectar de
 *   forma idempotente si ya se invitó a este egresado a este proyecto.
 * - `mensaje` es un fallback corto y fijo (no interpola el título) para no
 *   arriesgar el tope de 255 de la columna; el render real usa la plantilla i18n.
 */
export function buildInvitacionProyectoNotificacion(input: {
  idUsuario: string
  tituloProyecto: string
  idProyecto: string
}): NotificacionInput {
  return {
    idUsuario: input.idUsuario,
    tipoEvento: 'invitacion_proyecto',
    params: { titulo: input.tituloProyecto, idProyecto: input.idProyecto },
    urlDestino: `/${DEFAULT_LOCALE}/egresado/projects/${input.idProyecto}`,
    mensaje:
      'Una empresa te invitó a postular en un proyecto. Revisá la propuesta; esto no te inscribe.',
  }
}
