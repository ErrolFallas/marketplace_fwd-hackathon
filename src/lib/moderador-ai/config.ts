import 'server-only'
import { z } from 'zod'

/**
 * Configuración del AGENTE MODERADOR IA leída de variables de entorno y validada
 * con Zod (reglas §5). Usa las variables MODERATOR_AI_* EXCLUSIVAS de esta
 * feature: este es el único módulo que las lee y la key se pasa explícita al
 * cliente, así ninguna otra parte de la app consume estos tokens. Cada feature de
 * IA usa su propio prefijo <FEATURE>_AI_* con su propia key (convención de
 * proposal-ai/config.ts). Un solo proveedor compatible con OpenAI vía OpenRouter.
 * Lanza 'AI_NOT_CONFIGURED' si falta o es inválida.
 */
const aiEnvSchema = z.object({
  MODERATOR_AI_API_KEY: z.string().min(1),
  MODERATOR_AI_MODEL: z.string().min(1),
  MODERATOR_AI_BASE_URL: z.url(),
})

export interface ModeradorAiConfig {
  apiKey: string
  model: string
  baseUrl: string
}

export function getModeradorAiConfig(): ModeradorAiConfig {
  const parsed = aiEnvSchema.safeParse({
    MODERATOR_AI_API_KEY: process.env.MODERATOR_AI_API_KEY,
    MODERATOR_AI_MODEL: process.env.MODERATOR_AI_MODEL,
    MODERATOR_AI_BASE_URL: process.env.MODERATOR_AI_BASE_URL,
  })
  if (!parsed.success) {
    throw new Error('AI_NOT_CONFIGURED')
  }
  return {
    apiKey: parsed.data.MODERATOR_AI_API_KEY,
    model: parsed.data.MODERATOR_AI_MODEL,
    baseUrl: parsed.data.MODERATOR_AI_BASE_URL,
  }
}
