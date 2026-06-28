'use client'

import { useSyncExternalStore } from 'react'
import {
  subscribeResumen,
  getResumenSnapshot,
  getResumenServerSnapshot,
  refrescarResumen,
  marcarUnaComoLeida,
  marcarTodasComoLeidas,
  type ResumenNotificacionesSnapshot,
} from '@/lib/notifications/notifications-poll-store'

interface UseNotificacionesResumen extends ResumenNotificacionesSnapshot {
  refrescar: () => void
  marcarUna: (id: string) => Promise<void>
  marcarTodas: () => Promise<void>
}

/**
 * Lee el resumen de notificaciones desde el store de polling compartido. El
 * componente no monta ningún `useEffect` de fetching: la suscripción y el ciclo
 * de vida del polling viven en el store y se comparten entre montajes.
 */
export function useNotificacionesResumen(): UseNotificacionesResumen {
  const snapshot = useSyncExternalStore(
    subscribeResumen,
    getResumenSnapshot,
    getResumenServerSnapshot,
  )

  return {
    ...snapshot,
    refrescar: refrescarResumen,
    marcarUna: marcarUnaComoLeida,
    marcarTodas: marcarTodasComoLeidas,
  }
}
