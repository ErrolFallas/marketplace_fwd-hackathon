'use server'

import { after } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/dal'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import { crearNotificacion } from '@/lib/notifications/create'
import { DEFAULT_LOCALE } from '@/i18n/config'
import { resolveBaseUrl } from '@/lib/email/base-url'
import { createGmailTransport, getGmailFrom } from '@/lib/email/gmail'
import {
  mensajeNuevoHtml,
  mensajeNuevoSubject,
} from '@/lib/email/templates/mensaje-nuevo'
import { shouldSendMessageEmail, truncarSnippet } from './mensaje-email-logic'
import { sortConversacionesByActividad } from './conversaciones-logic'
import { programarModeracion } from '@/lib/moderador-ai/moderar'

const CONTENIDO_MAX = 2000

export interface Mensaje {
  idMensaje: string
  idProyecto: string
  idRemitente: string
  contenido: string
  leido: boolean
  fechaEnvio: string
}

export interface ConversacionItem {
  idProyecto: string
  tituloProyecto: string
  nombreContraparte: string
  estado: 'contratada' | 'finalizada' | 'cancelada'
  noLeidos: number
  ultimoMensaje: string | null
  ultimoMensajeFecha: string | null
  ultimoMensajeEsMio: boolean
}

interface ResumenConversacion {
  noLeidos: number
  ultimoMensaje: string | null
  ultimoMensajeFecha: string | null
  ultimoMensajeEsMio: boolean
}

interface AccesoMensajes {
  puedeEnviar: boolean
  estaVerificado: boolean
  idUsuarioContraparte: string
  urlContraparteBase: string
}

const EnviarMensajeSchema = z.object({
  idProyecto: z.string().uuid(),
  contenido: z.string().trim().min(1).max(CONTENIDO_MAX),
})

/**
 * Resuelve si el usuario tiene acceso al hilo del proyecto y qué puede hacer.
 * Verifica dos caminos: empresario dueño del proyecto, o egresado contratado/finalizado.
 * Con admin client porque la tabla mensajes no tiene RLS policies (ver deuda-tecnica-mensajes.md).
 */
async function resolveAccesoMensajes(
  idProyecto: string,
  idUsuario: string,
): Promise<Result<AccesoMensajes>> {
  const admin = createSupabaseAdminClient()

  // Camino 1: el usuario es empresario dueño del proyecto
  const { data: empresario, error: empError } = await admin
    .from('empresarios')
    .select('id_empresario, estado_verificacion')
    .eq('id_usuario', idUsuario)
    .maybeSingle()

  if (empError) {
    logger.error('resolveAccesoMensajes: fallo al leer empresario', {
      error: empError.message,
    })
    return err('unexpected')
  }

  if (empresario) {
    const { data: proyecto, error: projError } = await admin
      .from('proyectos')
      .select('id_proyecto')
      .eq('id_proyecto', idProyecto)
      .eq('id_empresario', empresario.id_empresario)
      .maybeSingle()

    if (projError) {
      logger.error(
        'resolveAccesoMensajes: fallo al verificar propiedad del proyecto',
        {
          error: projError.message,
        },
      )
      return err('unexpected')
    }
    if (!proyecto) return err('unauthorized')

    const { data: part, error: partError } = await admin
      .from('participaciones')
      .select('estado, id_estudiante')
      .eq('id_proyecto', idProyecto)
      .in('estado', ['contratada', 'finalizada', 'cancelada'])
      .maybeSingle()

    if (partError) {
      logger.error('resolveAccesoMensajes: fallo al leer participacion', {
        error: partError.message,
      })
      return err('unexpected')
    }
    if (!part) return err('sin_contratacion')

    const { data: estudianteData, error: estError } = await admin
      .from('estudiantes')
      .select('id_usuario')
      .eq('id_estudiante', part.id_estudiante)
      .maybeSingle()

    if (estError || !estudianteData) {
      logger.error('resolveAccesoMensajes: fallo al leer estudiante', {
        error: estError?.message,
      })
      return err('unexpected')
    }

    return ok({
      puedeEnviar: part.estado === 'contratada',
      estaVerificado: empresario.estado_verificacion === 'verificado',
      idUsuarioContraparte: estudianteData.id_usuario,
      urlContraparteBase: '/egresado/mensajes',
    })
  }

  // Camino 2: el usuario es egresado con participacion en el proyecto
  const { data: estudianteProfile, error: estProfileError } = await admin
    .from('estudiantes')
    .select('id_estudiante, estado_verificacion')
    .eq('id_usuario', idUsuario)
    .maybeSingle()

  if (estProfileError) {
    logger.error('resolveAccesoMensajes: fallo al leer perfil estudiante', {
      error: estProfileError.message,
    })
    return err('unexpected')
  }
  if (!estudianteProfile) return err('unauthorized')

  const { data: part, error: partError } = await admin
    .from('participaciones')
    .select('estado')
    .eq('id_proyecto', idProyecto)
    .eq('id_estudiante', estudianteProfile.id_estudiante)
    .in('estado', ['contratada', 'finalizada', 'cancelada'])
    .maybeSingle()

  if (partError) {
    logger.error(
      'resolveAccesoMensajes: fallo al leer participacion del egresado',
      {
        error: partError.message,
      },
    )
    return err('unexpected')
  }
  if (!part) return err('unauthorized')

  const { data: proyecto, error: projError } = await admin
    .from('proyectos')
    .select('id_empresario')
    .eq('id_proyecto', idProyecto)
    .maybeSingle()

  if (projError || !proyecto) {
    logger.error('resolveAccesoMensajes: fallo al leer proyecto del egresado', {
      error: projError?.message,
    })
    return err('unexpected')
  }

  const { data: empData, error: empDataError } = await admin
    .from('empresarios')
    .select('id_usuario')
    .eq('id_empresario', proyecto.id_empresario)
    .maybeSingle()

  if (empDataError || !empData) {
    logger.error(
      'resolveAccesoMensajes: fallo al leer empresario del proyecto',
      {
        error: empDataError?.message,
      },
    )
    return err('unexpected')
  }

  return ok({
    puedeEnviar: part.estado === 'contratada',
    estaVerificado: estudianteProfile.estado_verificacion === 'verificado',
    idUsuarioContraparte: empData.id_usuario,
    urlContraparteBase: '/empresario/mensajes',
  })
}

/** Obtiene el hilo de mensajes de un proyecto (RF-45). */
export async function getMensajesDeProyecto(
  idProyecto: string,
): Promise<Result<{ mensajes: Mensaje[]; puedeEnviar: boolean }>> {
  const parsed = z.string().uuid().safeParse(idProyecto)
  if (!parsed.success) return err('invalid_input')

  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const acceso = await resolveAccesoMensajes(parsed.data, user.id)
  if (!acceso.ok) return err(acceso.error)

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('mensajes')
    .select(
      'id_mensaje, id_proyecto, id_remitente, contenido, leido, fecha_envio',
    )
    .eq('id_proyecto', parsed.data)
    .order('fecha_envio', { ascending: true })

  if (error) {
    logger.error('getMensajesDeProyecto: fallo al leer mensajes', {
      error: error.message,
    })
    return err('mensajes_load_failed')
  }

  const mensajes: Mensaje[] = (data ?? []).map((row) => ({
    idMensaje: row.id_mensaje,
    idProyecto: row.id_proyecto,
    idRemitente: row.id_remitente,
    contenido: row.contenido,
    leido: row.leido,
    fechaEnvio: row.fecha_envio,
  }))

  return ok({ mensajes, puedeEnviar: acceso.data.puedeEnviar })
}

/**
 * Envía el correo de "mensaje nuevo" al destinatario (RF-46). Best-effort: lee
 * el correo/nombre con admin (la RLS oculta el correo de la contraparte) y el
 * título del proyecto; cualquier fallo se loguea y se traga, nunca aborta el
 * envío del mensaje (que ya quedó persistido).
 */
async function enviarEmailMensajeNuevo(params: {
  idUsuarioDestino: string
  idProyecto: string
  urlContraparteBase: string
  contenido: string
}): Promise<void> {
  const admin = createSupabaseAdminClient()
  const { data: destinatario } = await admin
    .from('usuarios')
    .select('correo, nombre')
    .eq('id_usuario', params.idUsuarioDestino)
    .maybeSingle()
  if (!destinatario?.correo) return

  const { data: proyecto } = await admin
    .from('proyectos')
    .select('titulo')
    .eq('id_proyecto', params.idProyecto)
    .maybeSingle()
  const titulo = proyecto?.titulo ?? 'tu proyecto'

  let transport: ReturnType<typeof createGmailTransport>
  try {
    transport = createGmailTransport()
  } catch (e) {
    logger.error('enviarEmailMensajeNuevo: Gmail no configurado', {
      error: e instanceof Error ? e.message : String(e),
    })
    return
  }

  const baseUrl = await resolveBaseUrl()
  const urlConversacion = `${baseUrl}/${DEFAULT_LOCALE}${params.urlContraparteBase}?proyecto=${params.idProyecto}`

  try {
    await transport.sendMail({
      from: getGmailFrom(),
      to: destinatario.correo,
      subject: mensajeNuevoSubject(titulo),
      html: mensajeNuevoHtml({
        nombre: destinatario.nombre ?? '',
        tituloProyecto: titulo,
        urlConversacion,
        snippet: truncarSnippet(params.contenido),
      }),
    })
  } catch (e) {
    logger.error('enviarEmailMensajeNuevo: fallo al enviar', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}

/** Envía un mensaje al hilo de un proyecto (RF-38 / RF-45). Solo permitido en estado contratada. */
export async function enviarMensaje(
  input: z.infer<typeof EnviarMensajeSchema>,
): Promise<Result<Mensaje>> {
  const parsed = EnviarMensajeSchema.safeParse(input)
  if (!parsed.success) return err('invalid_input')

  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const acceso = await resolveAccesoMensajes(parsed.data.idProyecto, user.id)
  if (!acceso.ok) return err(acceso.error)
  if (!acceso.data.estaVerificado) return err('cuenta_no_verificada')
  if (!acceso.data.puedeEnviar) return err('proyecto_finalizado')

  const admin = createSupabaseAdminClient()
  const { data: mensaje, error } = await admin
    .from('mensajes')
    .insert({
      id_proyecto: parsed.data.idProyecto,
      id_remitente: user.id,
      contenido: parsed.data.contenido,
    })
    .select(
      'id_mensaje, id_proyecto, id_remitente, contenido, leido, fecha_envio',
    )
    .single()

  if (error || !mensaje) {
    if (error?.message?.includes('rate_limit_exceeded')) {
      return err('rate_limited')
    }
    logger.error('enviarMensaje: fallo al insertar', { error: error?.message })
    return err('envio_fallido')
  }

  // Throttle del correo (RF-46): ¿el destinatario ya tiene un aviso de mensaje
  // sin leer en este hilo? Se consulta ANTES de crear la notificación de este
  // mensaje para no contarla a sí misma. Si la query falla, no se manda correo.
  const { count: avisosSinLeer, error: throttleError } = await admin
    .from('notificaciones')
    .select('id_notificacion', { count: 'exact', head: true })
    .eq('id_usuario', acceso.data.idUsuarioContraparte)
    .eq('tipo_evento', 'mensaje_nuevo')
    .eq('leida', false)
    .eq('params->>idProyecto', parsed.data.idProyecto)

  // Best-effort: no aborta el envío si la notificación falla (RF-47)
  void crearNotificacion({
    idUsuario: acceso.data.idUsuarioContraparte,
    tipoEvento: 'mensaje_nuevo',
    mensaje: 'Tienes un mensaje nuevo',
    urlDestino: `${acceso.data.urlContraparteBase}?proyecto=${parsed.data.idProyecto}`,
    params: { idProyecto: parsed.data.idProyecto },
  })

  // Correo best-effort con throttle (RF-46): solo al primer mensaje sin leer.
  // Se agenda con after() para no bloquear la respuesta con el envío SMTP: corre
  // tras enviarse la respuesta al cliente y Next garantiza su ejecución en
  // serverless (a diferencia de un promise suelto, que el runtime podría matar).
  if (
    !throttleError &&
    shouldSendMessageEmail({ priorUnreadCount: avisosSinLeer ?? 0 })
  ) {
    after(() =>
      enviarEmailMensajeNuevo({
        idUsuarioDestino: acceso.data.idUsuarioContraparte,
        idProyecto: parsed.data.idProyecto,
        urlContraparteBase: acceso.data.urlContraparteBase,
        contenido: parsed.data.contenido,
      }),
    )
  }

  // Moderación de convivencia (best-effort, post-respuesta): analiza el mensaje
  // sin bloquear el envío. Solo informa a un admin; nunca sanciona aquí.
  programarModeracion({
    entidad: 'mensaje',
    idEntidad: mensaje.id_mensaje,
    texto: mensaje.contenido,
    idAutor: user.id,
  })

  return ok({
    idMensaje: mensaje.id_mensaje,
    idProyecto: mensaje.id_proyecto,
    idRemitente: mensaje.id_remitente,
    contenido: mensaje.contenido,
    leido: mensaje.leido,
    fechaEnvio: mensaje.fecha_envio,
  })
}

/** Marca como leídos todos los mensajes recibidos (del otro participante) en el proyecto. */
export async function marcarLeidos(idProyecto: string): Promise<Result<void>> {
  const parsed = z.string().uuid().safeParse(idProyecto)
  if (!parsed.success) return err('invalid_input')

  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const acceso = await resolveAccesoMensajes(parsed.data, user.id)
  if (!acceso.ok) return err(acceso.error)

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('mensajes')
    .update({ leido: true })
    .eq('id_proyecto', parsed.data)
    .neq('id_remitente', user.id)
    .eq('leido', false)

  if (error) {
    logger.error('marcarLeidos: fallo al actualizar', { error: error.message })
    return err('update_failed')
  }

  return ok(undefined)
}

/**
 * Resume cada proyecto en su último mensaje y su conteo de no leídos en una
 * sola consulta. Nota de escala: trae los mensajes de los proyectos del usuario
 * ordenados por fecha y reduce en cliente; el primero visto por proyecto (orden
 * descendente) es el último mensaje. Para un MVP el volumen es bajo; si crece,
 * el reemplazo natural es un DISTINCT ON en una RPC. Usa admin client porque la
 * tabla mensajes no tiene RLS (ver deuda-tecnica-mensajes.md).
 */
async function getResumenPorProyecto(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  proyectoIds: string[],
  idUsuario: string,
): Promise<Map<string, ResumenConversacion>> {
  const resumen = new Map<string, ResumenConversacion>()
  if (proyectoIds.length === 0) return resumen

  const { data: mensajesRecientes, error } = await admin
    .from('mensajes')
    .select('id_proyecto, contenido, fecha_envio, id_remitente, leido')
    .in('id_proyecto', proyectoIds)
    .order('fecha_envio', { ascending: false })

  if (error) {
    logger.error('getResumenPorProyecto: fallo al leer mensajes', {
      error: error.message,
    })
    return resumen
  }

  for (const mensaje of mensajesRecientes ?? []) {
    let entrada = resumen.get(mensaje.id_proyecto)
    if (!entrada) {
      entrada = {
        noLeidos: 0,
        ultimoMensaje: mensaje.contenido,
        ultimoMensajeFecha: mensaje.fecha_envio,
        ultimoMensajeEsMio: mensaje.id_remitente === idUsuario,
      }
      resumen.set(mensaje.id_proyecto, entrada)
    }
    if (!mensaje.leido && mensaje.id_remitente !== idUsuario) {
      entrada.noLeidos += 1
    }
  }

  return resumen
}

/** Lista las conversaciones activas del empresario (proyectos con egresado contratado/finalizado). */
export async function getConversacionesEmpresario(): Promise<
  Result<ConversacionItem[]>
> {
  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const admin = createSupabaseAdminClient()

  const { data: empresario, error: empError } = await admin
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', user.id)
    .maybeSingle()

  if (empError) {
    logger.error('getConversacionesEmpresario: fallo al leer empresario', {
      error: empError.message,
    })
    return err('unexpected')
  }
  if (!empresario) return err('empresario_no_encontrado')

  const { data: proyectos, error: projError } = await admin
    .from('proyectos')
    .select('id_proyecto, titulo')
    .eq('id_empresario', empresario.id_empresario)

  if (projError) {
    logger.error('getConversacionesEmpresario: fallo al leer proyectos', {
      error: projError.message,
    })
    return err('unexpected')
  }
  if (!proyectos || proyectos.length === 0) return ok([])

  const proyectoIds = proyectos.map((p) => p.id_proyecto)

  const { data: participaciones, error: partError } = await admin
    .from('participaciones')
    .select('id_proyecto, estado, id_estudiante')
    .in('id_proyecto', proyectoIds)
    .in('estado', ['contratada', 'finalizada', 'cancelada'])

  if (partError) {
    logger.error('getConversacionesEmpresario: fallo al leer participaciones', {
      error: partError.message,
    })
    return err('unexpected')
  }
  if (!participaciones || participaciones.length === 0) return ok([])

  const estudianteIds = participaciones.map((p) => p.id_estudiante)

  const { data: estudiantes, error: estError } = await admin
    .from('estudiantes')
    .select('id_estudiante, id_usuario')
    .in('id_estudiante', estudianteIds)

  if (estError) {
    logger.error('getConversacionesEmpresario: fallo al leer estudiantes', {
      error: estError.message,
    })
    return err('unexpected')
  }

  const usuarioIds = (estudiantes ?? []).map((e) => e.id_usuario)

  const { data: usuarios, error: usrError } = await admin
    .from('usuarios')
    .select('id_usuario, nombre, apellido_1, apellido_2')
    .in('id_usuario', usuarioIds)

  if (usrError) {
    logger.error(
      'getConversacionesEmpresario: fallo al leer nombres de estudiantes',
      {
        error: usrError.message,
      },
    )
    return err('unexpected')
  }

  const proyectoMap = new Map(proyectos.map((p) => [p.id_proyecto, p.titulo]))
  const estudianteMap = new Map(
    (estudiantes ?? []).map((e) => [e.id_estudiante, e.id_usuario]),
  )
  const usuarioMap = new Map(
    (usuarios ?? []).map((u) => [
      u.id_usuario,
      u.apellido_2
        ? `${u.nombre} ${u.apellido_1} ${u.apellido_2}`
        : `${u.nombre} ${u.apellido_1}`,
    ]),
  )

  const resumenMap = await getResumenPorProyecto(admin, proyectoIds, user.id)

  const conversaciones: ConversacionItem[] = participaciones.flatMap((part) => {
    if (
      part.estado !== 'contratada' &&
      part.estado !== 'finalizada' &&
      part.estado !== 'cancelada'
    )
      return []
    const titulo = proyectoMap.get(part.id_proyecto)
    const idUsuarioEst = estudianteMap.get(part.id_estudiante)
    const nombreContraparte = idUsuarioEst
      ? usuarioMap.get(idUsuarioEst)
      : undefined
    if (!titulo || !nombreContraparte) return []
    const resumen = resumenMap.get(part.id_proyecto)
    return [
      {
        idProyecto: part.id_proyecto,
        tituloProyecto: titulo,
        nombreContraparte,
        estado: part.estado,
        noLeidos: resumen?.noLeidos ?? 0,
        ultimoMensaje: resumen?.ultimoMensaje ?? null,
        ultimoMensajeFecha: resumen?.ultimoMensajeFecha ?? null,
        ultimoMensajeEsMio: resumen?.ultimoMensajeEsMio ?? false,
      },
    ]
  })

  return ok(sortConversacionesByActividad(conversaciones))
}

/** Lista las conversaciones activas del egresado (proyectos donde fue contratado/finalizado). */
export async function getConversacionesEgresado(): Promise<
  Result<ConversacionItem[]>
> {
  const user = await getCurrentUser()
  if (!user) return err('unauthorized')

  const admin = createSupabaseAdminClient()

  const { data: estudiante, error: estError } = await admin
    .from('estudiantes')
    .select('id_estudiante')
    .eq('id_usuario', user.id)
    .maybeSingle()

  if (estError) {
    logger.error('getConversacionesEgresado: fallo al leer estudiante', {
      error: estError.message,
    })
    return err('unexpected')
  }
  if (!estudiante) return err('estudiante_no_encontrado')

  const { data: participaciones, error: partError } = await admin
    .from('participaciones')
    .select('id_proyecto, estado')
    .eq('id_estudiante', estudiante.id_estudiante)
    .in('estado', ['contratada', 'finalizada', 'cancelada'])

  if (partError) {
    logger.error('getConversacionesEgresado: fallo al leer participaciones', {
      error: partError.message,
    })
    return err('unexpected')
  }
  if (!participaciones || participaciones.length === 0) return ok([])

  const proyectoIds = participaciones.map((p) => p.id_proyecto)

  const { data: proyectos, error: projError } = await admin
    .from('proyectos')
    .select('id_proyecto, titulo, id_empresario')
    .in('id_proyecto', proyectoIds)

  if (projError) {
    logger.error('getConversacionesEgresado: fallo al leer proyectos', {
      error: projError.message,
    })
    return err('unexpected')
  }

  const empresarioIds = (proyectos ?? []).map((p) => p.id_empresario)

  const { data: empresarios, error: empError } = await admin
    .from('empresarios')
    .select('id_empresario, id_usuario, nombre_empresa')
    .in('id_empresario', empresarioIds)

  if (empError) {
    logger.error('getConversacionesEgresado: fallo al leer empresarios', {
      error: empError.message,
    })
    return err('unexpected')
  }

  // Fallback: si nombre_empresa es null, usar usuarios.nombre
  const sinNombreEmpresa = (empresarios ?? []).filter(
    (e) => e.nombre_empresa === null,
  )

  let usuarioNombreMap = new Map<string, string>()
  if (sinNombreEmpresa.length > 0) {
    const usuarioIds = sinNombreEmpresa.map((e) => e.id_usuario)
    const { data: usuarios, error: usrError } = await admin
      .from('usuarios')
      .select('id_usuario, nombre')
      .in('id_usuario', usuarioIds)

    if (usrError) {
      logger.error(
        'getConversacionesEgresado: fallo al leer usuarios de empresa',
        {
          error: usrError.message,
        },
      )
      return err('unexpected')
    }
    usuarioNombreMap = new Map(
      (usuarios ?? []).map((u) => [u.id_usuario, u.nombre]),
    )
  }

  const proyectoMap = new Map(
    (proyectos ?? []).map((p) => [
      p.id_proyecto,
      { titulo: p.titulo, idEmpresario: p.id_empresario },
    ]),
  )
  const empresarioMap = new Map(
    (empresarios ?? []).map((e) => [
      e.id_empresario,
      e.nombre_empresa ?? usuarioNombreMap.get(e.id_usuario) ?? '',
    ]),
  )

  const resumenMap = await getResumenPorProyecto(admin, proyectoIds, user.id)

  const conversaciones: ConversacionItem[] = participaciones.flatMap((part) => {
    if (
      part.estado !== 'contratada' &&
      part.estado !== 'finalizada' &&
      part.estado !== 'cancelada'
    )
      return []
    const proyectoData = proyectoMap.get(part.id_proyecto)
    const nombreContraparte = proyectoData
      ? empresarioMap.get(proyectoData.idEmpresario)
      : undefined
    if (!proyectoData || !nombreContraparte) return []
    const resumen = resumenMap.get(part.id_proyecto)
    return [
      {
        idProyecto: part.id_proyecto,
        tituloProyecto: proyectoData.titulo,
        nombreContraparte,
        estado: part.estado,
        noLeidos: resumen?.noLeidos ?? 0,
        ultimoMensaje: resumen?.ultimoMensaje ?? null,
        ultimoMensajeFecha: resumen?.ultimoMensajeFecha ?? null,
        ultimoMensajeEsMio: resumen?.ultimoMensajeEsMio ?? false,
      },
    ]
  })

  return ok(sortConversacionesByActividad(conversaciones))
}
