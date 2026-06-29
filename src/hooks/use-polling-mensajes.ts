'use client'

import { useEffect, useRef } from 'react'
import { getMensajesDeProyecto, type Mensaje } from '@/lib/mensajes/actions'
import { logger } from '@/lib/logger'

const POLL_INTERVAL_MS = 10_000
const BACKOFF_MAX_MS = 60_000

export interface MensajesActualizados {
  mensajes: Mensaje[]
  puedeEnviar: boolean
}

/**
 * Firma barata de la conversación para evitar re-render/scroll cuando el hilo
 * no cambió. Cambia si hay un mensaje nuevo (longitud), si alguno pasó a leído
 * (conteo de leídos) o si cambió el permiso de envío.
 */
export function firmaConversacion(datos: MensajesActualizados): string {
  const leidos = datos.mensajes.reduce((n, m) => (m.leido ? n + 1 : n), 0)
  const ultimo = datos.mensajes[datos.mensajes.length - 1]
  return `${datos.mensajes.length}:${leidos}:${ultimo?.idMensaje ?? ''}:${datos.puedeEnviar}`
}

/**
 * Refresca en vivo el hilo de la conversación abierta. Es una suscripción a un
 * sistema externo (timer + visibilidad), no un manager de estado: el estado
 * sigue viviendo en el componente, que recibe los datos por `onActualizar`.
 *
 * - Pausa los ticks cuando la pestaña está oculta y refetcha al volver visible.
 * - Backoff exponencial ante errores y guard de petición en vuelo.
 * - Solo llama a `onActualizar` cuando el hilo realmente cambió (firma), para
 *   no re-renderizar ni mover el scroll en cada tick.
 */
export function usePollingMensajes(
  idProyecto: string | null,
  onActualizar: (datos: MensajesActualizados) => void,
): void {
  const callbackRef = useRef(onActualizar)
  callbackRef.current = onActualizar

  useEffect(() => {
    if (!idProyecto) return
    const id = idProyecto

    let cancelado = false
    let enVuelo = false
    let fallos = 0
    let ultimaFirma = ''
    let timer: ReturnType<typeof setTimeout> | null = null

    function computeDelay(): number {
      if (fallos === 0) return POLL_INTERVAL_MS
      return Math.min(POLL_INTERVAL_MS * 2 ** fallos, BACKOFF_MAX_MS)
    }

    function agendar(): void {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void tick(), computeDelay())
    }

    async function tick(): Promise<void> {
      if (cancelado || enVuelo) return
      if (typeof document !== 'undefined' && document.hidden) {
        agendar()
        return
      }
      enVuelo = true
      try {
        const resultado = await getMensajesDeProyecto(id)
        if (cancelado) return
        if (resultado.ok) {
          fallos = 0
          const firma = firmaConversacion(resultado.data)
          if (firma !== ultimaFirma) {
            ultimaFirma = firma
            callbackRef.current(resultado.data)
          }
        } else {
          fallos += 1
        }
      } catch (error) {
        if (!cancelado) {
          fallos += 1
          logger.warn('use-polling-mensajes: tick fallido', {
            message: error instanceof Error ? error.message : String(error),
          })
        }
      } finally {
        enVuelo = false
        if (!cancelado) agendar()
      }
    }

    function onVisibilidad(): void {
      if (typeof document !== 'undefined' && !document.hidden) void tick()
    }

    agendar()
    document.addEventListener('visibilitychange', onVisibilidad)

    return () => {
      cancelado = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibilidad)
    }
  }, [idProyecto])
}
