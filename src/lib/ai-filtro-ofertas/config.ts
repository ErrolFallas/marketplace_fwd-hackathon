import 'server-only'
import { serverEnv } from '@/lib/env.server'

/**
 * Configuración del REVISOR IA de postulaciones (filtro de ofertas). Lee SUS
 * PROPIAS variables OPENROUTER_FILTRO_OFERTAS_* (ya validadas como opcionales en
 * env.server.ts). Este es el único módulo del feature que las consume; la key se
 * pasa explícita al cliente OpenAI/OpenRouter, sin tocar ninguna otra feature de
 * IA (proposal-ai, moderador) ni compartir key con ellas.
 *
 * A diferencia de otras features de IA, el revisor es ADVISORY y fail-open: si no
 * está configurado NO lanza, devuelve null y el llamador degrada a 'no_disponible'
 * (RNF-34). Un fallo de IA nunca bloquea al egresado.
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_MODEL = 'openai/gpt-4o-mini'

export interface FiltroOfertasConfig {
  apiKey: string
  model: string
  baseUrl: string
}

/** Devuelve la config, o null si falta la API key (fail-open, no lanza). */
export function getFiltroOfertasConfig(): FiltroOfertasConfig | null {
  const apiKey = serverEnv.OPENROUTER_FILTRO_OFERTAS_API_KEY
  if (!apiKey) {
    return null
  }
  return {
    apiKey,
    model: serverEnv.OPENROUTER_FILTRO_OFERTAS_MODEL ?? DEFAULT_MODEL,
    baseUrl: OPENROUTER_BASE_URL,
  }
}
