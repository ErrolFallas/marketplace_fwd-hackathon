import 'server-only'
import { getCotizadorProvider } from './provider'
import { leerStackRepo } from './github'
import { contrastarStack } from './github-logic'
import type {
  ContrasteStack,
  EstimacionIaResultado,
  HorasPorModulo,
  StackReport,
} from './types'
import { logger } from '@/lib/logger'

/**
 * Orquestador del cotizador IA. Encapsula el FAIL-OPEN (RNF-34): lee el stack de
 * GitHub best-effort, pide a la IA los rangos O/P y contrasta el stack. NUNCA
 * lanza y NUNCA calcula dinero (eso es el motor puro). Si algo falla, devuelve
 * propuesta vacía + fuenteOP='fallback' y el motor deriva O/P de la M.
 */

export interface EstimarInput {
  projectTitle: string
  projectDescription: string
  tecnologiasRequeridas: string[]
  horasM: HorasPorModulo
  githubUrl: string | null
}

const AVISO = {
  repoUrlInvalida: 'repo_url_invalida',
  repoNoLeido: 'repo_no_leido',
  iaNoDisponible: 'ia_no_disponible',
  iaSinPropuesta: 'ia_sin_propuesta',
} as const

function contraste(
  stack: StackReport | null,
  requeridas: string[],
): ContrasteStack | null {
  if (!stack || requeridas.length === 0) return null
  return contrastarStack(stack.detectadas, requeridas)
}

export async function estimarConIA(
  input: EstimarInput,
): Promise<EstimacionIaResultado> {
  const avisos: string[] = []
  let stack: StackReport | null = null

  // 1) Stack de GitHub (best-effort; no bloquea nada).
  if (input.githubUrl && input.githubUrl.trim().length > 0) {
    const res = await leerStackRepo(input.githubUrl)
    if (res.ok) stack = res.data
    else
      avisos.push(
        res.error === 'url_invalida'
          ? AVISO.repoUrlInvalida
          : AVISO.repoNoLeido,
      )
  }

  // 2) Propuesta O/P de la IA (fail-open).
  const provider = getCotizadorProvider()
  if (!provider) {
    avisos.push(AVISO.iaNoDisponible)
    return {
      propuesta: {},
      fuenteOP: 'fallback',
      stack,
      contraste: contraste(stack, input.tecnologiasRequeridas),
      avisos,
    }
  }

  try {
    const propuesta = await provider.proponerRangos({
      projectTitle: input.projectTitle,
      projectDescription: input.projectDescription,
      tecnologiasRequeridas: input.tecnologiasRequeridas,
      stackDetectado: stack?.detectadas ?? [],
      horasM: input.horasM,
    })
    const tienePropuesta = Object.keys(propuesta).length > 0
    if (!tienePropuesta) avisos.push(AVISO.iaSinPropuesta)
    return {
      propuesta,
      fuenteOP: tienePropuesta ? 'ia' : 'fallback',
      stack,
      contraste: contraste(stack, input.tecnologiasRequeridas),
      avisos,
    }
  } catch (error) {
    logger.warn('cotizador_estimar_fail', {
      error: error instanceof Error ? error.message : String(error),
    })
    avisos.push(AVISO.iaNoDisponible)
    return {
      propuesta: {},
      fuenteOP: 'fallback',
      stack,
      contraste: contraste(stack, input.tecnologiasRequeridas),
      avisos,
    }
  }
}
