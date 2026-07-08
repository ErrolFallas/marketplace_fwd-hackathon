import 'server-only'
import OpenAI from 'openai'
import { getModeradorAiConfig } from './config'
import { veredictoSchema, type Veredicto } from './schemas'
import { systemModerar, construirMensajeUsuario } from './prompt'
import type { ModerarTextoInput } from './types'
import { logger } from '@/lib/logger'

/**
 * Proveedor de IA del moderador (intercambiable): un solo modelo y una sola API
 * key vía OpenRouter, con una única llamada — Moderar. Calca el patrón de
 * proposal-ai/provider.ts (SDK openai, JSON mode, Zod, reintentos) pero con una
 * sola forma de respuesta.
 */

const TIMEOUT_MS = 30_000
// El veredicto es un JSON chico (7 campos, razón de una frase); 600 sobra.
const MAX_TOKENS = 600
// Temperatura muy baja: la moderación se juzga por consistencia, no variedad.
const TEMPERATURE = 0.1
// Reintentos ante respuesta vacía o JSON inválido del modelo.
const MAX_LLM_RETRIES = 3

/** Recorta el JSON del contenido aunque venga envuelto en prosa o ```json. */
function extractJson(content: string): unknown {
  const trimmed = content.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  let raw = fence?.[1]?.trim() ?? trimmed
  if (!raw.startsWith('{')) {
    const inicio = raw.indexOf('{')
    const fin = raw.lastIndexOf('}')
    if (inicio !== -1 && fin > inicio) {
      raw = raw.slice(inicio, fin + 1)
    }
  }
  return JSON.parse(raw)
}

export interface ModeradorProvider {
  readonly modelId: string
  moderar(input: ModerarTextoInput): Promise<Veredicto>
}

export function getModeradorProvider(): ModeradorProvider {
  const config = getModeradorAiConfig()
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    timeout: TIMEOUT_MS,
  })

  return {
    modelId: config.model,

    async moderar({ entidad, texto }) {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemModerar() },
        { role: 'user', content: construirMensajeUsuario(entidad, texto) },
      ]

      let ultimoMotivo = 'sin_respuesta'
      for (let intento = 0; intento < MAX_LLM_RETRIES; intento++) {
        const completion = await client.chat.completions.create({
          model: config.model,
          messages,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKENS,
          // JSON mode: obliga a emitir JSON válido. Requiere la palabra "JSON" en
          // el prompt — ya está en el system prompt.
          response_format: { type: 'json_object' },
        })

        const choice = completion.choices[0]
        const finishReason = choice?.finish_reason ?? 'desconocido'
        const contenido = choice?.message?.content?.trim() ?? ''
        if (!contenido) {
          ultimoMotivo = `respuesta vacía (finish_reason=${finishReason})`
          logger.warn('moderador_ai_empty_content', { intento, finishReason })
          continue
        }

        let parsed: unknown
        try {
          parsed = extractJson(contenido)
        } catch (error) {
          ultimoMotivo = `JSON no parseable (finish_reason=${finishReason})`
          logger.warn('moderador_ai_invalid_json', {
            intento,
            finishReason,
            error: error instanceof Error ? error.message : String(error),
          })
          continue
        }

        const result = veredictoSchema.safeParse(parsed)
        if (result.success) return result.data
        ultimoMotivo = 'JSON no cumple el schema'
        logger.warn('moderador_ai_schema_mismatch', {
          intento,
          issues: result.error.issues.map(
            (issue) => `${issue.path.join('.')}: ${issue.message}`,
          ),
        })
      }
      throw new Error(`AI_INVALID_JSON: ${ultimoMotivo}`)
    },
  }
}
