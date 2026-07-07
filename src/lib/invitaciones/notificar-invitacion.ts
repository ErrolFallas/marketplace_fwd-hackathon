import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { crearNotificacion } from '@/lib/notifications/create'
import { buildInvitacionProyectoNotificacion } from './invitacion-notificacion-logic'

/**
 * Avisa in-app al egresado que un empresario lo invitó a postular a un proyecto.
 * Correo DIFERIDO a propósito (SMTP de Gmail marcado como spam + la columna de
 * silenciado de notificaciones aún no se respeta): por ahora solo in-app.
 * Best-effort: resuelve `id_estudiante → id_usuario` con el cliente admin y nunca
 * lanza. Devuelve `true` si creó la notificación.
 */
export async function notificarInvitacionProyecto(params: {
  idEstudiante: string
  idProyecto: string
  tituloProyecto: string
}): Promise<boolean> {
  try {
    const admin = createSupabaseAdminClient()
    const { data } = await admin
      .from('estudiantes')
      .select('id_usuario')
      .eq('id_estudiante', params.idEstudiante)
      .maybeSingle()

    const idUsuario = data?.id_usuario
    if (!idUsuario) return false

    const result = await crearNotificacion(
      buildInvitacionProyectoNotificacion({
        idUsuario,
        tituloProyecto: params.tituloProyecto,
        idProyecto: params.idProyecto,
      }),
    )
    if (!result.ok) {
      logger.error('notificarInvitacionProyecto: notificacion fallida', {
        error: result.error,
      })
      return false
    }
    return true
  } catch (e) {
    logger.error('notificarInvitacionProyecto: error', {
      error: e instanceof Error ? e.message : String(e),
    })
    return false
  }
}
