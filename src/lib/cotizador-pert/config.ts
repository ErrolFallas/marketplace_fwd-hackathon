import 'server-only'
import { z } from 'zod'

/**
 * Configuración del COTIZADOR IA (advisory: propone rangos O/P y lee el stack de
 * GitHub). Lee sus PROPIAS variables COTIZADOR_AI_* con Zod (convención de
 * proposal-ai/moderador-ai). A diferencia de esas features, es FAIL-OPEN: si
 * falta o es inválida NO lanza — devuelve null y el llamador degrada al fallback
 * determinista. Un fallo de IA nunca bloquea al egresado (RNF-34).
 */
const OPENROUTER_BASE_URL_DEFAULT = 'https://openrouter.ai/api/v1'
const DEFAULT_MODEL = 'openai/gpt-4o-mini'

const aiEnvSchema = z.object({
  COTIZADOR_AI_API_KEY: z.string().min(1),
  COTIZADOR_AI_MODEL: z.string().min(1).optional(),
  COTIZADOR_AI_BASE_URL: z.url().optional(),
})

export interface CotizadorAiConfig {
  apiKey: string
  model: string
  baseUrl: string
}

/** Devuelve la config, o null si falta/está mal la API key (fail-open). */
export function getCotizadorAiConfig(): CotizadorAiConfig | null {
  const parsed = aiEnvSchema.safeParse({
    COTIZADOR_AI_API_KEY: process.env.COTIZADOR_AI_API_KEY,
    COTIZADOR_AI_MODEL: process.env.COTIZADOR_AI_MODEL,
    COTIZADOR_AI_BASE_URL: process.env.COTIZADOR_AI_BASE_URL,
  })
  if (!parsed.success) return null
  return {
    apiKey: parsed.data.COTIZADOR_AI_API_KEY,
    model: parsed.data.COTIZADOR_AI_MODEL ?? DEFAULT_MODEL,
    baseUrl: parsed.data.COTIZADOR_AI_BASE_URL ?? OPENROUTER_BASE_URL_DEFAULT,
  }
}

/** Token opcional de GitHub: sube el límite de la API de 60 a 5000 req/h. */
export function getCotizadorGithubToken(): string | null {
  const t = process.env.COTIZADOR_GITHUB_TOKEN
  return typeof t === 'string' && t.trim().length > 0 ? t.trim() : null
}
