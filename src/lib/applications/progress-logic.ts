import type { EstadoParticipacion } from '@/lib/projects/project-detail-logic'

/**
 * Progreso de una participación para el egresado (RF-30/RF-32). El "viaje" de una
 * oferta es una secuencia real de sobre cerrado, no una barra de porcentaje:
 *   1. enviada      -> el sobre está sellado, nadie lo abrió
 *   2. en_revision  -> la empresa abrió tu sobre y lo está evaluando
 *   3. resultado    -> desenlace: adjudicada / no seleccionada / retirada / cancelada
 *
 * La entrada es el estado EFECTIVO (ya derivado por `computeEstadoParticipacionEfectivo`,
 * RF-32): si el proyecto se cerró y tu oferta seguía viva, acá llega como
 * `no_seleccionada`/`cancelada`, no como `enviada`. Así el stepper nunca miente
 * mostrando "sigue sellada" sobre un proyecto que ya se decidió.
 *
 * Los timestamps por transición viven en la tabla `participaciones`
 * (`revision_iniciada_at`, `adjudicada_at`, ...), así que cada hito puede fecharse.
 * `revisionIniciadaAt !== null` es la prueba dura de que el sobre SÍ se abrió: sin
 * él, el hito "en revisión" queda pendiente (caso derivado que nunca se abrió), en
 * vez de inventar una revisión que no ocurrió.
 */

export type ProgressStepKey = 'enviada' | 'en_revision' | 'resultado'

/** `failed` = hito final terminal no-positivo (rechazo/aborto); el color lo decide `outcome`. */
export type ProgressStepStatus = 'done' | 'current' | 'pending' | 'failed'

export type ParticipacionOutcome =
  | 'pending'
  | 'positive'
  | 'negative'
  | 'aborted'

export interface ParticipacionTimestamps {
  fechaPostulacion: string
  revisionIniciadaAt: string | null
  adjudicadaAt: string | null
  noSeleccionadaAt: string | null
  retiradaAt: string | null
}

export interface ProgressStep {
  key: ProgressStepKey
  status: ProgressStepStatus
  date: string | null
}

export interface ParticipacionProgress {
  outcome: ParticipacionOutcome
  /** Estado a etiquetar en el hito final; `null` mientras sigue pendiente. */
  resultadoEstado: EstadoParticipacion | null
  steps: readonly [ProgressStep, ProgressStep, ProgressStep]
}

export function computeParticipacionProgress(
  estadoEfectivo: EstadoParticipacion,
  ts: ParticipacionTimestamps,
): ParticipacionProgress {
  const abrioSobre = ts.revisionIniciadaAt !== null

  switch (estadoEfectivo) {
    case 'enviada':
      return {
        outcome: 'pending',
        resultadoEstado: null,
        steps: [
          { key: 'enviada', status: 'current', date: ts.fechaPostulacion },
          { key: 'en_revision', status: 'pending', date: null },
          { key: 'resultado', status: 'pending', date: null },
        ],
      }
    case 'en_revision':
      return {
        outcome: 'pending',
        resultadoEstado: null,
        steps: [
          { key: 'enviada', status: 'done', date: ts.fechaPostulacion },
          {
            key: 'en_revision',
            status: 'current',
            date: ts.revisionIniciadaAt,
          },
          { key: 'resultado', status: 'pending', date: null },
        ],
      }
    case 'contratada':
    case 'finalizada':
      return {
        outcome: 'positive',
        resultadoEstado: estadoEfectivo,
        steps: [
          { key: 'enviada', status: 'done', date: ts.fechaPostulacion },
          { key: 'en_revision', status: 'done', date: ts.revisionIniciadaAt },
          { key: 'resultado', status: 'done', date: ts.adjudicadaAt },
        ],
      }
    case 'no_seleccionada':
      return {
        outcome: 'negative',
        resultadoEstado: 'no_seleccionada',
        steps: [
          { key: 'enviada', status: 'done', date: ts.fechaPostulacion },
          {
            key: 'en_revision',
            status: abrioSobre ? 'done' : 'pending',
            date: ts.revisionIniciadaAt,
          },
          { key: 'resultado', status: 'failed', date: ts.noSeleccionadaAt },
        ],
      }
    case 'retirada':
      return {
        outcome: 'aborted',
        resultadoEstado: 'retirada',
        steps: [
          { key: 'enviada', status: 'done', date: ts.fechaPostulacion },
          {
            key: 'en_revision',
            status: abrioSobre ? 'done' : 'pending',
            date: ts.revisionIniciadaAt,
          },
          { key: 'resultado', status: 'failed', date: ts.retiradaAt },
        ],
      }
    case 'cancelada':
      return {
        outcome: 'aborted',
        resultadoEstado: 'cancelada',
        steps: [
          { key: 'enviada', status: 'done', date: ts.fechaPostulacion },
          {
            key: 'en_revision',
            status: abrioSobre ? 'done' : 'pending',
            date: ts.revisionIniciadaAt,
          },
          // `cancelada` es derivado del proyecto: no hay timestamp en la participación.
          { key: 'resultado', status: 'failed', date: null },
        ],
      }
  }
}
