import {
  getMiResumenNotificaciones,
  marcarNotificacionLeida,
  marcarTodasMisNotificacionesLeidas,
  type NotificacionItem,
} from '@/lib/notifications/actions'
import { logger } from '@/lib/logger'

/**
 * Store de cliente que centraliza el polling del resumen de notificaciones
 * (lista + conteo sin leer). Se expone vía `useSyncExternalStore` desde el hook
 * `useNotificacionesResumen`, de modo que el campanazo lea siempre el último
 * snapshot sin montar su propio `useEffect` de fetching.
 *
 * Al ser un singleton de módulo (vive mientras la pestaña esté abierta):
 * - Pausa el fetch cuando la pestaña está oculta (`document.hidden`) y lo
 *   reanuda al volver visible solo si los datos vencieron.
 * - Aplica backoff exponencial ante errores y un guard de petición en vuelo.
 * - Sobrevive al desmontaje/remontaje del campanazo, así que navegar entre
 *   páginas no vuelve a disparar el fetch si el snapshot aún está fresco.
 */
const POLL_INTERVAL_MS = 60_000
const BACKOFF_MAX_MS = 300_000
const REQUEST_TIMEOUT_MS = 10_000
const STALE_THRESHOLD_MS = POLL_INTERVAL_MS

export type EstadoResumen = 'inicial' | 'cargando' | 'listo' | 'error'

export interface ResumenNotificacionesSnapshot {
  notificaciones: NotificacionItem[]
  conteoNoLeidas: number
  estado: EstadoResumen
}

const EMPTY_SNAPSHOT: ResumenNotificacionesSnapshot = {
  notificaciones: [],
  conteoNoLeidas: 0,
  estado: 'inicial',
}

let snapshot: ResumenNotificacionesSnapshot = EMPTY_SNAPSHOT
const listeners = new Set<() => void>()
let timeoutId: ReturnType<typeof setTimeout> | null = null
let isFetching = false
let failCount = 0
let lastSuccessAt: number | null = null

function setSnapshot(next: ResumenNotificacionesSnapshot): void {
  snapshot = next
  listeners.forEach((listener) => listener())
}

/**
 * Devuelve la referencia actual del snapshot. Debe ser estable entre llamadas
 * sin cambios o `useSyncExternalStore` entraría en un bucle de renders: por eso
 * solo `setSnapshot` reemplaza la referencia.
 */
export function getResumenSnapshot(): ResumenNotificacionesSnapshot {
  return snapshot
}

export function getResumenServerSnapshot(): ResumenNotificacionesSnapshot {
  return EMPTY_SNAPSHOT
}

/** Backoff exponencial acotado por {@link BACKOFF_MAX_MS}. Puro para testear. */
export function computeBackoffDelay(
  fallos: number,
  baseMs: number = POLL_INTERVAL_MS,
  maxMs: number = BACKOFF_MAX_MS,
): number {
  if (fallos <= 0) return baseMs
  return Math.min(baseMs * 2 ** fallos, maxMs)
}

async function conTimeout<T>(promesa: Promise<T>, ms: number): Promise<T> {
  let temporizador: ReturnType<typeof setTimeout> | undefined
  const limite = new Promise<never>((_, reject) => {
    temporizador = setTimeout(() => reject(new Error('timeout')), ms)
  })
  try {
    return await Promise.race([promesa, limite])
  } finally {
    if (temporizador) clearTimeout(temporizador)
  }
}

async function fetchResumen(): Promise<void> {
  if (isFetching) return
  if (typeof document !== 'undefined' && document.hidden) return
  isFetching = true
  if (snapshot.estado === 'inicial') {
    setSnapshot({ ...snapshot, estado: 'cargando' })
  }
  try {
    const result = await conTimeout(
      getMiResumenNotificaciones(),
      REQUEST_TIMEOUT_MS,
    )
    if (result.ok) {
      failCount = 0
      lastSuccessAt = Date.now()
      setSnapshot({
        notificaciones: result.data.notificaciones,
        conteoNoLeidas: result.data.conteoNoLeidas,
        estado: 'listo',
      })
    } else {
      failCount += 1
      setSnapshot({ ...snapshot, estado: 'error' })
      logger.warn('notifications-poll: lectura fallida', {
        error: result.error,
        failCount,
      })
    }
  } catch (error) {
    failCount += 1
    setSnapshot({ ...snapshot, estado: 'error' })
    logger.warn('notifications-poll: excepcion o timeout', {
      message: error instanceof Error ? error.message : String(error),
      failCount,
    })
  } finally {
    isFetching = false
  }
}

async function tick(): Promise<void> {
  await fetchResumen()
  if (listeners.size > 0) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => void tick(), computeBackoffDelay(failCount))
  }
}

function isStale(): boolean {
  return (
    lastSuccessAt === null || Date.now() - lastSuccessAt >= STALE_THRESHOLD_MS
  )
}

function handleVisibilityChange(): void {
  if (typeof document === 'undefined' || document.hidden) return
  if (isStale()) void fetchResumen()
}

export function subscribeResumen(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    if (isStale()) {
      void tick()
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => void tick(), computeBackoffDelay(failCount))
    }
  }
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }
}

/** Fuerza una lectura inmediata (ej. al abrir el panel). Respeta el guard. */
export function refrescarResumen(): void {
  void fetchResumen()
}

export async function marcarUnaComoLeida(id: string): Promise<void> {
  const previo = snapshot
  setSnapshot({
    ...snapshot,
    notificaciones: snapshot.notificaciones.map((n) =>
      n.id_notificacion === id ? { ...n, leida: true } : n,
    ),
    conteoNoLeidas: Math.max(0, snapshot.conteoNoLeidas - 1),
  })
  const result = await marcarNotificacionLeida(id)
  if (!result.ok) {
    setSnapshot(previo)
    logger.warn('notifications-poll: marcar una fallo', { error: result.error })
  }
}

export async function marcarTodasComoLeidas(): Promise<void> {
  const previo = snapshot
  setSnapshot({
    ...snapshot,
    notificaciones: snapshot.notificaciones.map((n) => ({ ...n, leida: true })),
    conteoNoLeidas: 0,
  })
  const result = await marcarTodasMisNotificacionesLeidas()
  if (!result.ok) {
    setSnapshot(previo)
    logger.warn('notifications-poll: marcar todas fallo', {
      error: result.error,
    })
  }
}

/** Reinicia el estado del singleton. Exclusivo para tests. */
export function resetStoreForTests(): void {
  snapshot = EMPTY_SNAPSHOT
  listeners.clear()
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  isFetching = false
  failCount = 0
  lastSuccessAt = null
}
