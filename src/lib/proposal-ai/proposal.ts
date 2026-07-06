'use server'

import { getTranslations } from 'next-intl/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ok, err, type Result } from '@/lib/result'
import { logger } from '@/lib/logger'
import { toJsonb } from '@/lib/supabase/json'
import { getAiProvider } from './provider'
import type { HistorialEntry } from './types'
import type { PropuestaGeneradaRaw } from './schemas'
import { getProjectCatalogs } from '@/lib/projects/actions'
import { parseHistorial, parseLogistica } from '@/lib/projects/persistence'
import { resolveCatalog } from './proposal-mapping'
import type { PropuestaProyecto } from '@/lib/projects/schemas'

const MAX_INTENTOS = 3

export type ProposalOutcome =
  | { estado: 'ok'; propuesta: PropuestaProyecto; historial: HistorialEntry[] }
  | { estado: 'rechazada'; historial: HistorialEntry[] }

/**
 * Genera la propuesta (errolpendiente §1 paso 6, llamadas #2 y #3): arma la
 * propuesta, resuelve nombres contra el catálogo y la valida ANTES de mostrarla.
 * Si falla la validación, reintenta con los ajustes hasta MAX_INTENTOS; tras eso
 * la rechaza con las razones (el flujo le sugiere contactar a un admin).
 */
export async function generateProposal(
  conversationId: string,
  localeParam?: string,
): Promise<Result<ProposalOutcome>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return err('unauthorized')
    }

    const { data: empresario, error: empError } = await supabase
      .from('empresarios')
      .select('id_empresario, estado_verificacion')
      .eq('id_usuario', user.id)
      .maybeSingle()
    if (empError) {
      logger.error('generateProposal: fallo al leer empresario', {
        error: empError.message,
      })
      return err('unexpected')
    }
    if (!empresario) {
      return err('empresario_no_encontrado')
    }
    // Gate de costo: la propuesta dispara hasta MAX_INTENTOS llamadas a la IA
    // (las más caras del flujo). Solo para empresas verificadas.
    if (empresario.estado_verificacion !== 'verificado') {
      return err('not_verified')
    }

    const { data: conv, error: convError } = await supabase
      .from('conversaciones_ia')
      .select('contexto_inicial, logistica, historial')
      .eq('id_conversacion', conversationId)
      .eq('id_empresario', empresario.id_empresario)
      .eq('estado', 'en_curso')
      .maybeSingle()
    if (convError) {
      logger.error('generateProposal: fallo al leer conversación', {
        error: convError.message,
      })
      return err('unexpected')
    }
    if (!conv) {
      return err('save_failed')
    }

    const contextoInicial = (conv.contexto_inicial ?? '').trim()
    if (contextoInicial.length === 0) {
      return err('no_context')
    }

    const catalogsRes = await getProjectCatalogs()
    if (!catalogsRes.ok) {
      return err('unexpected')
    }
    const catalogs = catalogsRes.data
    const logistica = parseLogistica(conv.logistica)
    const historial = parseHistorial(conv.historial)
    const provider = getAiProvider()
    const locale = localeParam === 'en' ? 'en' : 'es'

    let ajustes: string[] = []
    let ultimasRazones: string[] = []
    // Distingue un fallo TÉCNICO (la IA no devolvió JSON válido / timeout) de un
    // rechazo de CONTENIDO (validación #3 o catálogo). El técnico se reintenta y,
    // si persiste, sale como 'ai_failed' ("probá de nuevo"); el de contenido cae
    // a 'rechazada' (la IA explica en el chat qué falta).
    let ultimoFalloTecnico = false
    // Candidato VÁLIDO (pasó los 4 criterios de la validación #3 + el catálogo)
    // pero con exclusiones/datos inventados detectados. Se guarda como respaldo:
    // si no logramos una versión limpia dentro del presupuesto de intentos, se
    // devuelve IGUAL. La detección de invención solo dispara una pasada de
    // "limpieza"; NUNCA bloquea una propuesta publicable ni la manda a
    // 'rechazada' (decisión de UX: una exclusión de más molesta menos que
    // negarle la propuesta al empresario).
    let candidato: {
      propuesta: PropuestaProyecto
      raw: PropuestaGeneradaRaw
    } | null = null
    // Cap de UNA sola pasada de limpieza: la regeneración no es quirúrgica (rehace
    // toda la propuesta y puede colar OTRA invención), así que iterar más solo
    // sube la latencia sin garantizar convergencia. Una limpieza atrapa lo obvio;
    // el resto se acepta como candidato. Máximo 2 generaciones en este camino.
    let limpiezaHecha = false

    // Persiste la propuesta elegida (append-only) y arma el resultado 'ok'.
    const guardarYRetornar = async (
      propuesta: PropuestaProyecto,
      raw: PropuestaGeneradaRaw,
    ): Promise<Result<ProposalOutcome>> => {
      const historialFinal: HistorialEntry[] = [
        ...historial,
        {
          rol: 'ia',
          tipo: 'propuesta',
          contenido: JSON.stringify(propuesta),
          fecha: new Date().toISOString(),
        },
      ]
      const { data: updated, error: updateError } = await supabase
        .from('conversaciones_ia')
        .update({
          propuesta_generada: toJsonb(propuesta),
          stack_sugerido: toJsonb(raw.stackSugerido),
          nivel_tecnico_empresario: raw.nivelTecnico,
          historial: toJsonb(historialFinal),
          modelo_ia: provider.modelId,
        })
        .eq('id_conversacion', conversationId)
        .eq('id_empresario', empresario.id_empresario)
        .eq('estado', 'en_curso')
        .select('id_conversacion')
        .maybeSingle()
      if (updateError || !updated) {
        logger.error('generateProposal: fallo al guardar propuesta', {
          error: updateError?.message ?? 'sin_fila',
        })
        return err('save_failed')
      }
      return ok<ProposalOutcome>({
        estado: 'ok',
        propuesta,
        historial: historialFinal,
      })
    }

    for (let intento = 0; intento < MAX_INTENTOS; intento++) {
      let raw: PropuestaGeneradaRaw
      try {
        raw = await provider.generarPropuesta({
          contextoInicial,
          logistica,
          historial,
          catalogos: {
            areas: catalogs.areas.map((area) => area.nombre),
            categorias: catalogs.categorias.map(
              (categoria) => categoria.nombre,
            ),
            tecnologias: catalogs.tecnologias.map(
              (tecnologia) => tecnologia.nombre,
            ),
          },
          ajustes,
          locale,
        })
        ultimoFalloTecnico = false
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'error_desconocido'
        // AI_NOT_CONFIGURED no se reintenta: lo mapea el catch externo.
        if (msg === 'AI_NOT_CONFIGURED') throw e
        // callJson ya reintentó 3 veces internamente; repetir la ronda completa
        // sería lento (y agravaría el "spinner infinito"). Cortamos y salimos
        // como fallo técnico → 'ai_failed' (mensaje claro, no un cuelgue).
        logger.error(
          'generateProposal: la IA no devolvió una propuesta válida',
          {
            intento,
            error: msg,
          },
        )
        ultimoFalloTecnico = true
        break
      }

      const categorias = resolveCatalog(raw.categorias, catalogs.categorias)
      const tecnologias = resolveCatalog(raw.tecnologias, catalogs.tecnologias)
      const area = resolveCatalog([raw.area], catalogs.areas)[0] ?? null

      // Red de seguridad: si la IA no eligió del catálogo, no es publicable.
      // El área es obligatoria (RF-20), igual que al menos una categoría y una
      // tecnología.
      if (!area || categorias.length === 0 || tecnologias.length === 0) {
        ajustes = [
          'Elegí un área de negocio, al menos una categoría y una tecnología del catálogo provisto.',
        ]
        ultimasRazones = ajustes
        continue
      }

      // Validación #3: recibe el `historial` para detectar INVENCIÓN (exclusiones
      // o datos de temas ausentes de la conversación), además de los 4 criterios.
      const validacion = await provider.validarPropuesta(
        raw,
        contextoInicial,
        historial,
        locale,
      )
      if (!validacion.valido) {
        ajustes = validacion.ajustes
        ultimasRazones = validacion.razones
        continue
      }

      const propuesta: PropuestaProyecto = {
        titulo: raw.titulo.trim(),
        descripcion: raw.descripcion.trim(),
        requerimientosFuncionales: raw.requerimientosFuncionales
          .map((rf) => rf.trim())
          .filter(Boolean),
        // El guard de arriba garantiza `area` no nula (RF-20).
        idArea: area.id,
        areaNombre: area.nombre,
        categorias,
        tecnologias,
        stackSugerido: raw.stackSugerido,
        involucraIa: raw.involucraIa,
      }

      // Válida y SIN invención detectada → es la mejor posible: se devuelve ya.
      if (validacion.exclusionesInventadas.length === 0) {
        return await guardarYRetornar(propuesta, raw)
      }

      // Válida pero con invención: la guardamos como respaldo publicable. Si aún
      // no gastamos la única pasada de limpieza, pedimos regenerar quitando esas
      // menciones; si ya limpiamos una vez, cortamos y devolvemos el candidato
      // (no seguimos iterando por latencia).
      candidato = { propuesta, raw }
      if (limpiezaHecha) break
      limpiezaHecha = true
      ajustes = [
        `La versión anterior mencionó temas que el empresario NO pidió ni aceptó. Quitá SOLO estas menciones (no cambies nada más de la propuesta): ${validacion.exclusionesInventadas.join('; ')}`,
      ]
      ultimasRazones = []
    }

    // Si lo último fue un fallo técnico (no de contenido), un mensaje de "qué
    // falta" confundiría al empresario: pedimos reintentar.
    if (ultimoFalloTecnico) {
      logger.error('generateProposal: fallo técnico de la IA tras reintentos')
      return err('ai_failed')
    }

    // Teníamos una propuesta VÁLIDA con algún residuo de invención que no se
    // terminó de limpiar en los intentos: se devuelve igual. Una exclusión de
    // más es mejor que negarle la propuesta al empresario (decisión de UX).
    if (candidato) {
      logger.warn(
        'generateProposal: se devuelve candidato válido con posible invención tras agotar la limpieza',
      )
      return await guardarYRetornar(candidato.propuesta, candidato.raw)
    }

    // Rechazada tras los reintentos: la IA le explica al empresario qué falta,
    // en el chat (errolpendiente §5.1: tope de reintentos → explicar).
    const detalles = ajustes.length > 0 ? ajustes : ultimasRazones
    // Mensaje de chat visible al empresario → i18n (en su idioma, no hardcoded).
    const t = await getTranslations({ locale, namespace: 'ProjectPublish' })
    const mensajeRechazo =
      detalles.length > 0
        ? t('agentRejection.withDetails', { detalles: detalles.join('\n- ') })
        : t('agentRejection.noDetails')
    const historialRechazo: HistorialEntry[] = [
      ...historial,
      {
        rol: 'ia',
        tipo: 'mensaje',
        contenido: mensajeRechazo,
        fecha: new Date().toISOString(),
      },
    ]
    const { data: updatedRechazo, error: updateRechazoError } = await supabase
      .from('conversaciones_ia')
      .update({
        historial: toJsonb(historialRechazo),
        modelo_ia: provider.modelId,
      })
      .eq('id_conversacion', conversationId)
      .eq('id_empresario', empresario.id_empresario)
      .eq('estado', 'en_curso')
      .select('id_conversacion')
      .maybeSingle()
    if (updateRechazoError || !updatedRechazo) {
      logger.error('generateProposal: fallo al guardar feedback de rechazo', {
        error: updateRechazoError?.message ?? 'sin_fila',
      })
      return err('save_failed')
    }

    logger.warn('generateProposal: propuesta rechazada tras reintentos', {
      razones: ultimasRazones,
    })
    return ok<ProposalOutcome>({
      estado: 'rechazada',
      historial: historialRechazo,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unexpected_error'
    if (msg === 'AI_NOT_CONFIGURED') {
      return err('ai_not_configured')
    }
    logger.error('generateProposal: error inesperado', { error: msg })
    return err('ai_failed')
  }
}
