const MS_POR_DIA = 86_400_000

export type DayBucket = 'today' | 'yesterday' | 'older'

/** Medianoche local de la fecha dada, para comparar por día calendario. */
export function startOfLocalDay(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

/** Clasifica una fecha respecto a "ahora" en hoy / ayer / más antiguo (por día calendario local). */
export function classifyDay(fecha: Date, ahora: Date): DayBucket {
  const diaFecha = startOfLocalDay(fecha).getTime()
  const diaHoy = startOfLocalDay(ahora).getTime()
  const diffDias = Math.round((diaHoy - diaFecha) / MS_POR_DIA)
  if (diffDias <= 0) return 'today'
  if (diffDias === 1) return 'yesterday'
  return 'older'
}

/** True si ambas fechas caen en el mismo día calendario local. */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime()
}

/**
 * Ordena conversaciones por actividad reciente (último mensaje primero). Las que
 * no tienen mensajes (fecha null) quedan al final. No muta la entrada.
 */
export function sortConversacionesByActividad<
  T extends { ultimoMensajeFecha: string | null },
>(conversaciones: readonly T[]): T[] {
  return [...conversaciones].sort((a, b) => {
    if (a.ultimoMensajeFecha === b.ultimoMensajeFecha) return 0
    if (a.ultimoMensajeFecha === null) return 1
    if (b.ultimoMensajeFecha === null) return -1
    return b.ultimoMensajeFecha.localeCompare(a.ultimoMensajeFecha)
  })
}
