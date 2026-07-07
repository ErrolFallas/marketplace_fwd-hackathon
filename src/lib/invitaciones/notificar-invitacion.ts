import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { crearNotificacion } from '@/lib/notifications/create'
import { createGmailTransport, getGmailFrom } from '@/lib/email/gmail'
import { resolveBaseUrl } from '@/lib/email/base-url'
import { DEFAULT_LOCALE } from '@/i18n/config'
import { buildInvitacionProyectoNotificacion } from './invitacion-notificacion-logic'
import {
  invitacionProyectoHtml,
  invitacionProyectoSubject,
} from '@/lib/email/templates/invitacion-proyecto'

/**
 * Correo de aviso al egresado invitado. Best-effort: lee correo/nombre con el
 * cliente admin (la RLS oculta el correo de la contraparte) y cualquier fallo se
 * loguea y se traga para no abortar la invitación in-app que ya se creó.
 */
async function enviarEmailInvitacionProyecto(params: {
  idUsuario: string
  tituloProyecto: string
  idProyecto: string
}): Promise<void> {
  const admin = createSupabaseAdminClient()
  const { data: usuario } = await admin
    .from('usuarios')
    .select('correo, nombre')
    .eq('id_usuario', params.idUsuario)
    .maybeSingle()
  if (!usuario?.correo) return

  let transport: ReturnType<typeof createGmailTransport>
  try {
    transport = createGmailTransport()
  } catch (e) {
    logger.error('enviarEmailInvitacionProyecto: Gmail no configurado', {
      error: e instanceof Error ? e.message : String(e),
    })
    return
  }

  const baseUrl = await resolveBaseUrl()
  const urlProyecto = `${baseUrl}/${DEFAULT_LOCALE}/egresado/projects/${params.idProyecto}`

  try {
    await transport.sendMail({
      from: getGmailFrom(),
      to: usuario.correo,
      subject: invitacionProyectoSubject(params.tituloProyecto),
      html: invitacionProyectoHtml({
        nombre: usuario.nombre ?? '',
        tituloProyecto: params.tituloProyecto,
        urlProyecto,
      }),
    })
  } catch (e) {
    logger.error('enviarEmailInvitacionProyecto: fallo al enviar', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

/**
 * Avisa al egresado (in-app + correo) que un empresario lo invitó a postular a
 * un proyecto. El correo es solo un aviso, como el resto de eventos: NO lo
 * inscribe. Best-effort: resuelve `id_estudiante → id_usuario` con el cliente
 * admin y nunca lanza. Devuelve `true` si creó la notificación in-app.
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

    await enviarEmailInvitacionProyecto({
      idUsuario,
      tituloProyecto: params.tituloProyecto,
      idProyecto: params.idProyecto,
    })

    return true
  } catch (e) {
    logger.error('notificarInvitacionProyecto: error', {
      error: e instanceof Error ? e.message : String(e),
    })
    return false
  }
}
