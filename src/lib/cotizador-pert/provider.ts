import 'server-only'
import OpenAI from 'openai'
import { getCotizadorAiConfig } from './config'
import { aRangosPropuestos } from './schemas'
import { systemProponerRangos, construirMensajeProponerRangos } from './prompt'
import type { ProponerRangosInput, RangosPropuestos } from './types'
import { logger } from '@/lib/logger'

/**
 * Proveedor del cotizador IA (una llamada por estimación). Usa la key propia
 * COTIZADOR_AI_* vía OpenRouter con el SDK openai. Clon del patrón de
 * ai-filtro-ofertas/provider. Devuelve null si el feature no está configurado
 * (fail-open: el llamador degrada al fallback determinista).
 */

const TIMEOUT_MS = 20_000
const MAX_TOKENS = 500
// Temperatura baja: la estimación se juzga por consistencia, no por variedad.
const TEMPERATURE = 0.2
const MAX_LLM_RETRIES = 3

/** Recorta el JSON del contenido aunque venga envuelto en prosa o ```json. */
function extractJson(content: string): unknown {
  const trimmed = content.trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  let raw = fence?.[1]?.trim() ?? trimmed
  if (!raw.startsWith('{')) {
    const inicio = raw.indexOf('{')
    const fin = raw.lastIndexOf('}')
    if (inicio !== -1 && fin > inicio) raw = raw.slice(inicio, fin + 1)
  }
  return JSON.parse(raw)
}

export interface CotizadorProvider {
  readonly modelId: string
  proponerRangos(input: ProponerRangosInput): Promise<RangosPropuestos>
}

/** Devuelve el proveedor, o null si falta la config (fail-open). */
export function getCotizadorProvider(): CotizadorProvider | null {
  const config = getCotizadorAiConfig()
  if (!config) return null

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    timeout: TIMEOUT_MS,
  })

  return {
    modelId: config.model,

    async proponerRangos(input) {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemProponerRangos() },
        { role: 'user', content: construirMensajeProponerRangos(input) },
      ]

      let ultimoMotivo = 'sin_respuesta'
      for (let intento = 0; intento < MAX_LLM_RETRIES; intento++) {
        const completion = await client.chat.completions.create({
          model: config.model,
          messages,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKENS,
          response_format: { type: 'json_object' },
        })

        const choice = completion.choices[0]
        const contenido = choice?.message?.content?.trim() ?? ''
        if (!contenido) {
          ultimoMotivo = 'respuesta vacía'
          logger.warn('cotizador_empty_content', { intento })
          continue
        }

        let parsed: unknown
        try {
          parsed = extractJson(contenido)
        } catch {
          ultimoMotivo = 'JSON no parseable'
          logger.warn('cotizador_invalid_json', { intento })
          continue
        }

        // Aunque el saneo deje {} (todos los módulos descartados) es una
        // respuesta válida: el llamador decide si degrada al fallback.
        return aRangosPropuestos(parsed)
      }
      throw new Error(`AI_INVALID_JSON: ${ultimoMotivo}`)
    },
  }
}
