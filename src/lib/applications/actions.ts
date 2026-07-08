'use server'

import { z } from 'zod'
import { ok, err, type Result } from '@/lib/result'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireRole, requireVerifiedEgresado } from '@/lib/auth/guards'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { revisarPostulacion } from '@/lib/ai-filtro-ofertas/review'
import { validarUrlPrototipo } from '@/lib/ai-filtro-ofertas/link-safety-logic'
import { verificarLinkVivo } from '@/lib/ai-filtro-ofertas/link-check'
import {
  hashContenidoRevisado,
  parsearRevisionReenviada,
} from '@/lib/ai-filtro-ofertas/review-logic'
import type { RevisionResultado } from '@/lib/ai-filtro-ofertas/types'
import type { Database, Json } from '@/types/database'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { crearNotificacion } from '@/lib/notifications/create'
import { DEFAULT_LOCALE } from '@/i18n/config'
import { buildPostulacionNotificacion } from './postulacion-notificacion-logic'
import { programarModeracionDiferida } from '@/lib/moderador-ai/moderar'

const MIN_PLANTEAMIENTO_LEN = 30
const MAX_CARTA_LEN = 2800
const MIN_PROTOTIPO_ENLACES = 1
const MAX_PROTOTIPO_ENLACES = 4
const MAX_ENLACE_LEN = 500
const MAX_DOC_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB; coincide con el límite del bucket documentacion_tecnica
const DOC_TECNICA_BUCKET = 'documentacion_tecnica'
const DOC_TECNICA_EXTENSIONS = ['pdf', 'zip'] as const
const SIGNED_URL_TTL_SECONDS = 3600 // 1h, igual que getSignedUrlEntregable
// Versión del texto de consentimiento aceptado (trazabilidad si el copy cambia).
const CONSENTIMIENTO_PI_VERSION = 'pi-v1-2026-07'
const CONSENTIMIENTO_IA_VERSION = 'ia-v1-2026-07'

const PostularseSchema = z.object({
  id_proyecto: z.string().uuid(),
  planteamiento_solucion: z.string().min(MIN_PLANTEAMIENTO_LEN),
  prototipo_enlaces: z
    .array(z.string().url().max(MAX_ENLACE_LEN))
    .min(MIN_PROTOTIPO_ENLACES)
    .max(MAX_PROTOTIPO_ENLACES),
  // Carta OPCIONAL (el SRS no la exige). El documento técnico también es opcional
  // (RF-30 Should) y se valida aparte. La calidad la aconseja el revisor IA.
  carta_postulacion: z.string().max(MAX_CARTA_LEN).optional(),
})

const RevisarConIaSchema = z.object({
  id_proyecto: z.string().uuid(),
  planteamiento_solucion: z.string().min(MIN_PLANTEAMIENTO_LEN),
  carta_postulacion: z.string().max(MAX_CARTA_LEN).optional(),
})

const RetirarSchema = z.object({
  id_participacion: z.string().uuid(),
})

/**
 * Revisor IA de una postulación. ADVISORY: devuelve coaching por-campo y un
 * veredicto que NUNCA bloquea el envío (lo persiste `postularse`). Una sola
 * llamada al modelo. Si el feature está apagado o falla, devuelve estado
 * 'no_disponible' (fail-open, RNF-34). El cliente muestra el resultado y lo
 * reenvía al enviar la postulación.
 */
export async function revisarPostulacionConIA(
  input: z.infer<typeof RevisarConIaSchema>,
): Promise<Result<RevisionResultado>> {
  const parsed = RevisarConIaSchema.safeParse(input)
  if (!parsed.success) {
    return err('invalid_input')
  }

  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  const supabase = await createSupabaseServerClient()

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('titulo, descripcion, id_area_negocio')
    .eq('id_proyecto', parsed.data.id_proyecto)
    .single()
  if (proyectoError || !proyecto) {
    return err('proyecto_not_found')
  }

  const carta = parsed.data.carta_postulacion ?? null

  // Interruptor global (RNF-34): si el revisor está apagado, no_disponible sin
  // llamar al modelo.
  const { data: flag } = await supabase
    .from('configuracion_sistema')
    .select('valor')
    .eq('clave', 'filtro_ofertas_ia_activo')
    .maybeSingle()
  if (flag?.valor === 'false') {
    return ok({
      estado: 'no_disponible',
      modelo: null,
      detalle: { intentoManipulacion: false, items: [] },
      contentHash: hashContenidoRevisado(
        parsed.data.planteamiento_solucion,
        carta,
      ),
    })
  }

  let projectArea: string | null = null
  if (proyecto.id_area_negocio) {
    const { data: area } = await supabase
      .from('areas_negocio')
      .select('nombre')
      .eq('id_area', proyecto.id_area_negocio)
      .maybeSingle()
    projectArea = area?.nombre ?? null
  }

  const resultado = await revisarPostulacion({
    projectTitle: proyecto.titulo ?? 'Proyecto FWD',
    projectDescription: proyecto.descripcion ?? '',
    projectArea,
    planteamientoSolucion: parsed.data.planteamiento_solucion,
    cartaPostulacion: carta,
  })

  return ok(resultado)
}

/**
 * Permite a un Junior postularse a un proyecto abierto.
 * RF-27: Enviar oferta a proyecto abierto dentro del plazo.
 */
export async function postularse(formData: FormData): Promise<Result<void>> {
  // `prototipo_enlaces` viaja como JSON dentro del FormData (un array no cabe en
  // un campo plano); el resto son campos de texto y el documento va como File.
  let prototipoEnlaces: unknown
  try {
    const raw = formData.get('prototipo_enlaces')
    prototipoEnlaces = JSON.parse(typeof raw === 'string' ? raw : 'null')
  } catch {
    return err('invalid_input')
  }

  const cartaRaw = formData.get('carta_postulacion')
  const parsed = PostularseSchema.safeParse({
    id_proyecto: formData.get('id_proyecto'),
    planteamiento_solucion: formData.get('planteamiento_solucion'),
    prototipo_enlaces: prototipoEnlaces,
    carta_postulacion:
      typeof cartaRaw === 'string' && cartaRaw.length > 0
        ? cartaRaw
        : undefined,
  })
  if (!parsed.success) {
    return err('invalid_input')
  }

  // Consentimientos obligatorios (bloquean el envío, deterministas): propiedad
  // intelectual (RNF-36, para que el plagio recaiga en el usuario) y
  // procesamiento por IA (RNF-38). No dependen de la IA.
  const consintioPi = formData.get('consentimiento_pi') === 'true'
  const consintioIa = formData.get('consentimiento_ia') === 'true'
  if (!consintioPi || !consintioIa) {
    return err('consentimiento_requerido')
  }

  // Documento técnico: OPCIONAL (RF-30). Si viene, se valida tipo y tamaño.
  const file = formData.get('file')
  let fileValido: File | null = null
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_DOC_FILE_SIZE_BYTES) {
      return err('archivo_muy_grande')
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!(DOC_TECNICA_EXTENSIONS as readonly string[]).includes(ext)) {
      return err('tipo_archivo_invalido')
    }
    fileValido = file
  }

  // Seguridad del link (código, NO IA): todos los enlaces deben ser https a host
  // público (anti-SSRF, RNF-06). Un link inválido bloquea el envío para proteger
  // al empresario que después lo abrirá.
  for (const enlace of parsed.data.prototipo_enlaces) {
    if (!validarUrlPrototipo(enlace).ok) {
      return err('link_invalido')
    }
  }
  // El link principal debe RESPONDER: si no hay respuesta alguna (DNS falla,
  // conexión rechazada, timeout), se bloquea para que el egresado lo corrija.
  // Cualquier código HTTP (incl. 403/429) cuenta como vivo (anti falso bloqueo).
  const enlacePrincipal = parsed.data.prototipo_enlaces[0]
  if (
    enlacePrincipal &&
    (await verificarLinkVivo(enlacePrincipal)) === 'sin_respuesta'
  ) {
    return err('link_sin_respuesta')
  }

  const roleResult = await requireRole('egresado')
  if (!roleResult.ok) {
    return roleResult
  }

  const supabase = await createSupabaseServerClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return err('unauthenticated')
  }

  const { data: estudiante, error: estudianteError } = await supabase
    .from('estudiantes')
    .select('id_estudiante, estado_verificacion')
    .eq('id_usuario', userData.user.id)
    .single()

  if (estudianteError || !estudiante) {
    return err('estudiante_not_found')
  }

  if (estudiante.estado_verificacion !== 'verificado') {
    return err('cuenta_no_verificada')
  }

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('titulo, descripcion, estado, fecha_cierre, is_active')
    .eq('id_proyecto', parsed.data.id_proyecto)
    .single()

  if (proyectoError || !proyecto) {
    return err('proyecto_not_found')
  }

  if (
    !proyecto.is_active ||
    !['abierto', 'en_recepcion'].includes(proyecto.estado)
  ) {
    return err('proyecto_cerrado')
  }

  if (proyecto.fecha_cierre && new Date(proyecto.fecha_cierre) < new Date()) {
    return err('plazo_vencido')
  }

  // Veredicto del revisor IA (advisory, NO bloquea): si el egresado revisó antes
  // de enviar y el texto no cambió (hash coincide), se registra ese veredicto; si
  // no revisó o editó el texto, queda 'no_solicitada'. No se re-llama al modelo.
  const revision = parsearRevisionReenviada(
    leerJsonForm(formData.get('revision_ia')),
    parsed.data.planteamiento_solucion,
    parsed.data.carta_postulacion ?? null,
    new Date().toISOString(),
  )

  // El upload corre en el SERVIDOR a propósito (el cliente browser de Supabase se
  // cuelga al resolver la sesión). Se guarda el PATH del objeto (bucket privado);
  // la URL de descarga se firma al leer (getSignedUrlDocumentacionTecnica).
  let archivoPath: string | null = null
  if (fileValido) {
    const ext = fileValido.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    archivoPath = `${parsed.data.id_proyecto}/${userData.user.id}/${uniqueSuffix}.${ext}`
    const contentType = ext === 'pdf' ? 'application/pdf' : 'application/zip'
    const { error: uploadError } = await supabase.storage
      .from(DOC_TECNICA_BUCKET)
      .upload(archivoPath, fileValido, { contentType })
    if (uploadError) {
      logger.error('postularse: fallo al subir la documentación técnica', {
        error: uploadError.message,
      })
      return err('storage_error')
    }
  }

  const { error: insertError } = await supabase.from('participaciones').insert({
    id_proyecto: parsed.data.id_proyecto,
    id_estudiante: estudiante.id_estudiante,
    estado: 'enviada',
    carta_postulacion: parsed.data.carta_postulacion ?? null,
    planteamiento_solucion: parsed.data.planteamiento_solucion,
    prototipo_enlaces: parsed.data.prototipo_enlaces,
    documentacion_tecnica: archivoPath,
    revision_ia_estado: revision.estado,
    // Objeto plano JSON-serializable → columna jsonb.
    revision_ia_detalle: revision.detalle as Json | null,
    revision_ia_modelo: revision.modelo,
    revision_ia_at: revision.at,
  })

  if (insertError) {
    // Insert falló en firme: borrar el archivo recién subido para no dejar
    // huérfanos en el Storage.
    if (archivoPath) {
      await supabase.storage.from(DOC_TECNICA_BUCKET).remove([archivoPath])
    }
    logger.error('postularse failed', { error: insertError.message })
    if (
      insertError.code === 'P0001' ||
      insertError.message.toLowerCase().includes('cupo')
    ) {
      return err('cupo_excedido')
    }
    return err('database_error')
  }

  // Registro de consentimientos (evidencia legal, best-effort): la oferta ya se
  // guardó, así que un fallo del registro se loguea pero no la revierte (§8).
  await registrarConsentimientosPostulacion(userData.user.id)

  await notificarPostulacion(
    parsed.data.id_proyecto,
    proyecto.titulo ?? 'tu proyecto',
  )

  // Moderación de convivencia de la carta (best-effort), solo si el egresado la
  // incluyó. El insert no devuelve el id, así que se resuelve dentro del after()
  // con admin: no se toca este camino de escritura ni sus tests.
  if (parsed.data.carta_postulacion) {
    const carta = parsed.data.carta_postulacion
    const idProyecto = parsed.data.id_proyecto
    const idEstudiante = estudiante.id_estudiante
    programarModeracionDiferida({
      entidad: 'carta_postulacion',
      texto: carta,
      idAutor: userData.user.id,
      resolverIdEntidad: async () => {
        const admin = createSupabaseAdminClient()
        const { data } = await admin
          .from('participaciones')
          .select('id_participacion')
          .eq('id_proyecto', idProyecto)
          .eq('id_estudiante', idEstudiante)
          .order('fecha_postulacion', { ascending: false })
          .limit(1)
          .maybeSingle()
        return data?.id_participacion ?? null
      },
    })
  }

  revalidatePath('/egresado/applications')
  revalidatePath(`/egresado/projects/${parsed.data.id_proyecto}`)

  return ok(undefined)
}

/** Parsea un campo JSON del FormData sin lanzar (null si no es JSON válido). */
function leerJsonForm(raw: FormDataEntryValue | null): unknown {
  if (typeof raw !== 'string' || raw.length === 0) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Registra en `consentimientos` (evidencia con IP + user_agent + versión) la
 * declaración de propiedad intelectual (por postulación) y, si aún no lo tenía, el
 * consentimiento de procesamiento por IA (global, RNF-38). Usa service role: la
 * sesión es del egresado y la escritura de consentimientos se gestiona del lado
 * servidor (mismo patrón que el onboarding).
 */
async function registrarConsentimientosPostulacion(
  idUsuario: string,
): Promise<void> {
  try {
    const admin = createSupabaseAdminClient()
    const reqHeaders = await headers()
    const ipOrigen =
      reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = reqHeaders.get('user-agent')?.slice(0, 255) ?? null

    const inserts: Database['public']['Tables']['consentimientos']['Insert'][] =
      [
        {
          id_usuario: idUsuario,
          tipo_consentimiento: 'propiedad_intelectual',
          otorgado: true,
          ip_origen: ipOrigen,
          user_agent: userAgent,
          version_documento: CONSENTIMIENTO_PI_VERSION,
        },
      ]

    const { data: yaTieneIa } = await admin
      .from('consentimientos')
      .select('id_consentimiento')
      .eq('id_usuario', idUsuario)
      .eq('tipo_consentimiento', 'ia')
      .limit(1)
      .maybeSingle()
    if (!yaTieneIa) {
      inserts.push({
        id_usuario: idUsuario,
        tipo_consentimiento: 'ia',
        otorgado: true,
        ip_origen: ipOrigen,
        user_agent: userAgent,
        version_documento: CONSENTIMIENTO_IA_VERSION,
      })
    }

    const { error } = await admin.from('consentimientos').insert(inserts)
    if (error) {
      logger.error('postularse: fallo al registrar consentimientos', {
        error: error.message,
      })
    }
  } catch (e) {
    logger.error('postularse: excepción registrando consentimientos', {
      error: String(e),
    })
  }
}

/**
 * Genera una URL temporal (1h) para que el empresario dueño vea la documentación
 * técnica de una postulación. El bucket es privado: no se puede servir un enlace
 * permanente. Las filas legacy guardaban una URL externa (Drive/Docs); se
 * devuelven tal cual. Verifica propiedad antes de firmar (RF-34).
 */
export async function getSignedUrlDocumentacionTecnica(
  idParticipacion: string,
): Promise<Result<{ url: string }>> {
  if (!z.string().uuid().safeParse(idParticipacion).success) {
    return err('invalid_input')
  }

  const supabase = await createSupabaseServerClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return err('unauthenticated')
  }

  const { data: empresario, error: empError } = await supabase
    .from('empresarios')
    .select('id_empresario')
    .eq('id_usuario', userData.user.id)
    .maybeSingle()
  if (empError || !empresario) {
    return err('unauthorized')
  }

  // Lectura con service_role + verificación de propiedad explícita (mismo patrón
  // que getEstudianteContactEmail): la RLS no le deja al empresario leer la fila
  // completa de la participación de otro postulante.
  const admin = createSupabaseAdminClient()
  const { data: part, error: partError } = await admin
    .from('participaciones')
    .select('documentacion_tecnica, id_proyecto')
    .eq('id_participacion', idParticipacion)
    .maybeSingle()
  if (partError || !part) {
    return err('participacion_not_found')
  }
  if (!part.documentacion_tecnica) {
    return err('documento_not_found')
  }

  const { data: proyecto, error: proyError } = await admin
    .from('proyectos')
    .select('id_empresario')
    .eq('id_proyecto', part.id_proyecto)
    .maybeSingle()
  if (proyError || !proyecto) {
    return err('participacion_not_found')
  }
  if (proyecto.id_empresario !== empresario.id_empresario) {
    return err('unauthorized')
  }

  // Legacy: URL externa guardada antes del bucket (Drive/Docs) → tal cual.
  const doc = part.documentacion_tecnica
  if (doc.startsWith('http://') || doc.startsWith('https://')) {
    return ok({ url: doc })
  }

  const { data: signed, error: signError } = await admin.storage
    .from(DOC_TECNICA_BUCKET)
    .createSignedUrl(doc, SIGNED_URL_TTL_SECONDS)
  if (signError || !signed?.signedUrl) {
    logger.error('getSignedUrlDocumentacionTecnica: storage error', {
      error: signError?.message,
    })
    return err('storage_error')
  }

  return ok({ url: signed.signedUrl })
}

/**
 * Notifica al empresario dueño que recibió una nueva postulación
 * (`postulacion_recibida`). Best-effort y autoblindada: la postulación ya quedó
 * guardada, así que un fallo al notificar se loguea y se traga (log + decisión,
 * §8). Lee el `id_usuario` del empresario con `service_role`: la sesión es del
 * egresado y la RLS no le deja ver al dueño.
 */
async function notificarPostulacion(
  idProyecto: string,
  titulo: string,
): Promise<void> {
  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from('proyectos')
      .select('empresarios(id_usuario)')
      .eq('id_proyecto', idProyecto)
      .maybeSingle()
    if (error || !data) {
      logger.error('notificarPostulacion: no se pudo leer el proyecto', {
        idProyecto,
        error: error?.message,
      })
      return
    }
    const empresario = data.empresarios
    if (!empresario?.id_usuario) {
      logger.error('notificarPostulacion: proyecto sin empresario', {
        idProyecto,
      })
      return
    }
    const urlProyecto = `/${DEFAULT_LOCALE}/empresario/proyecto/${idProyecto}`
    const result = await crearNotificacion(
      buildPostulacionNotificacion({
        idUsuarioEmpresario: empresario.id_usuario,
        titulo,
        urlProyecto,
      }),
    )
    if (!result.ok) {
      logger.error('notificarPostulacion: fallo al crear la notificación', {
        idProyecto,
        error: result.error,
      })
    }
  } catch (e) {
    logger.error('notificarPostulacion: excepción inesperada', {
      idProyecto,
      error: String(e),
    })
  }
}

/**
 * Permite a un Junior retirar su oferta (RF-31)
 */
export async function retirarPostulacion(
  input: z.infer<typeof RetirarSchema>,
): Promise<Result<void>> {
  const parsed = RetirarSchema.safeParse(input)
  if (!parsed.success) {
    return err('invalid_input')
  }

  const verified = await requireVerifiedEgresado()
  if (!verified.ok) return verified

  const supabase = await createSupabaseServerClient()

  // Buscar la participación y asegurar que le pertenece y su estado permite retiro
  const { data: participacion, error: partError } = await supabase
    .from('participaciones')
    .select('id_participacion, estado, id_proyecto')
    .eq('id_participacion', parsed.data.id_participacion)
    .eq('id_estudiante', verified.data.id_estudiante)
    .single()

  if (partError || !participacion) {
    return err('participacion_not_found')
  }

  if (
    ['contratada', 'finalizada', 'cancelada', 'retirada'].includes(
      participacion.estado,
    )
  ) {
    return err('estado_invalido_retiro')
  }

  // RF-31: solo se puede retirar si el plazo NO ha vencido. Una vez cerrada la
  // ventana de ofertas, la oferta queda firme para la revisión del empresario.
  // Espejo de la verificación de `postularse`.
  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .select('fecha_cierre')
    .eq('id_proyecto', participacion.id_proyecto)
    .single()

  if (proyectoError || !proyecto) {
    return err('proyecto_not_found')
  }

  if (proyecto.fecha_cierre && new Date(proyecto.fecha_cierre) < new Date()) {
    return err('plazo_vencido')
  }

  // Actualizar a retirada
  const { error: updateError } = await supabase
    .from('participaciones')
    .update({ estado: 'retirada' })
    .eq('id_participacion', participacion.id_participacion)

  if (updateError) {
    logger.error('retirarPostulacion failed', { error: updateError.message })
    return err('database_error')
  }

  revalidatePath('/egresado/applications')
  return ok(undefined)
}
