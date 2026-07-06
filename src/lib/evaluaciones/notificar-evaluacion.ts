import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { crearNotificacion } from '@/lib/notifications/create'
import { createGmailTransport, getGmailFrom } from '@/lib/email/gmail'
import { resolveBaseUrl } from '@/lib/email/base-url'
import { DEFAULT_LOCALE } from '@/i18n/config'
import {
  buildEvaluacionRecibidaNotificacion,
  type EvaluacionDestino,
} from './evaluacion-notificacion-logic'
import {
  evaluacionRecibidaHtml,
  evaluacionRecibidaSubject,
} from '@/lib/email/templates/evaluacion-recibida'

// Ruta (sin base) del perfil de cada destinatario, para el enlace del correo.
const RUTA_PERFIL: Record<EvaluacionDestino, string> = {
  egresado: 'egresado/perfil',
  empresa: 'empresario/perfil',
}

/**
 * A quién notificar la calificación recibida. La identidad de dominio
 * (estudiante o empresario) se resuelve a `id_usuario` dentro del helper.
 */
type EvaluacionDestinatario =
  | { rol: 'egresado'; idEstudiante: string }
  | { rol: 'empresa'; idEmpresario: string }

/**
 * Correo a la parte calificada. Best-effort: lee correo/nombre con el cliente
 * admin (la RLS oculta el correo de la contraparte); cualquier fallo se loguea
 * y se traga para no abortar la calificación que lo disparó.
 */
async function enviarEmailEvaluacionRecibida(params: {
  idUsuario: string
  tituloProyecto: string
  destino: EvaluacionDestino
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
    logger.error('enviarEmailEvaluacionRecibida: Gmail no configurado', {
      error: e instanceof Error ? e.message : String(e),
    })
    return
  }

  const baseUrl = await resolveBaseUrl()
  const urlPerfil = `${baseUrl}/${DEFAULT_LOCALE}/${RUTA_PERFIL[params.destino]}`

  try {
    await transport.sendMail({
      from: getGmailFrom(),
      to: usuario.correo,
      subject: evaluacionRecibidaSubject(params.tituloProyecto),
      html: evaluacionRecibidaHtml({
        nombre: usuario.nombre ?? '',
        tituloProyecto: params.tituloProyecto,
        urlPerfil,
      }),
    })
  } catch (e) {
    logger.error('enviarEmailEvaluacionRecibida: fallo al enviar', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

/**
 * Avisa a la parte calificada (in-app + email) que recibió una nueva
 * calificación (RF-47 / RF-49). Best-effort: resuelve `id_usuario` desde el id
 * de dominio con el cliente admin y nunca lanza; un fallo al notificar no debe
 * revertir el `insert` de la evaluación que ya se guardó.
 */
export async function notificarEvaluacionRecibida(params: {
  destinatario: EvaluacionDestinatario
  tituloProyecto: string
}): Promise<void> {
  try {
    const admin = createSupabaseAdminClient()
    const { destinatario } = params

    let idUsuario: string | null = null
    if (destinatario.rol === 'egresado') {
      const { data } = await admin
        .from('estudiantes')
        .select('id_usuario')
        .eq('id_estudiante', destinatario.idEstudiante)
        .maybeSingle()
      idUsuario = data?.id_usuario ?? null
    } else {
      const { data } = await admin
        .from('empresarios')
        .select('id_usuario')
        .eq('id_empresario', destinatario.idEmpresario)
        .maybeSingle()
      idUsuario = data?.id_usuario ?? null
    }
    if (!idUsuario) return

    const destino: EvaluacionDestino =
      destinatario.rol === 'egresado' ? 'egresado' : 'empresa'

    const notifResult = await crearNotificacion(
      buildEvaluacionRecibidaNotificacion({
        idUsuario,
        tituloProyecto: params.tituloProyecto,
        destino,
      }),
    )
    if (!notifResult.ok) {
      logger.error('notificarEvaluacionRecibida: notificacion fallida', {
        error: notifResult.error,
      })
    }

    await enviarEmailEvaluacionRecibida({
      idUsuario,
      tituloProyecto: params.tituloProyecto,
      destino,
    })
  } catch (e) {
    logger.error('notificarEvaluacionRecibida: error al notificar', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}
