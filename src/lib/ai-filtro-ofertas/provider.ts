import 'server-only'
import OpenAI from 'openai'
import { getFiltroOfertasConfig } from './config'
import { revisionModeloSchema, type RevisionModelo } from './schemas'
import { systemRevisar, construirMensajeRevisar } from './prompt'
import type { RevisarPostulacionInput } from './types'
import { logger } from '@/lib/logger'

/**
 * Proveedor del revisor IA (una sola llamada por revisión). Usa la key propia del
 * filtro (OPENROUTER_FILTRO_OFERTAS_*) vía OpenRouter con el SDK openai. No
 * comparte nada con otras features de IA. Devuelve null si el feature no está
 * configurado (fail-open: el llamador degrada a 'no_disponible').
 */

const TIMEOUT_MS = 20_000
// La respuesta es un JSON chico: 2 booleanos y 2 listas de códigos cortos.
const MAX_TOKENS = 300
// Temperatura baja: la revisión se juzga por consistencia, no por variedad.
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

export interface RevisorProvider {
  readonly modelId: string
  revisar(input: RevisarPostulacionInput): Promise<RevisionModelo>
}

/** Devuelve el proveedor, o null si falta la config (fail-open). */
export function getRevisorProvider(): RevisorProvider | null {
  const config = getFiltroOfertasConfig()
  if (!config) return null

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    timeout: TIMEOUT_MS,
  })

  return {
    modelId: config.model,

    async revisar(input) {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemRevisar() },
        { role: 'user', content: construirMensajeRevisar(input) },
      ]

      let ultimoMotivo = 'sin_respuesta'
      for (let intento = 0; intento < MAX_LLM_RETRIES; intento++) {
        const completion = await client.chat.completions.create({
          model: config.model,
          messages,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKENS,
          // JSON mode: obliga a JSON válido. Requiere la palabra "JSON" en el
          // prompt (ya está en el system prompt).
          response_format: { type: 'json_object' },
        })

        const choice = completion.choices[0]
        const finishReason = choice?.finish_reason ?? 'desconocido'
        const contenido = choice?.message?.content?.trim() ?? ''
        if (!contenido) {
          ultimoMotivo = `respuesta vacía (finish_reason=${finishReason})`
          logger.warn('filtro_ofertas_empty_content', { intento, finishReason })
          continue
        }

        let parsed: unknown
        try {
          parsed = extractJson(contenido)
        } catch (error) {
          ultimoMotivo = `JSON no parseable (finish_reason=${finishReason})`
          logger.warn('filtro_ofertas_invalid_json', {
            intento,
            finishReason,
            error: error instanceof Error ? error.message : String(error),
          })
          continue
        }

        const result = revisionModeloSchema.safeParse(parsed)
        if (result.success) return result.data
        ultimoMotivo = 'JSON no cumple el schema'
        logger.warn('filtro_ofertas_schema_mismatch', {
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
