import { normalizarTexto } from '@/lib/utils/normalizar-texto'

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

export type OrdenDireccion = 'desc' | 'asc'

export type EstadoFiltro = 'todas' | 'contratada' | 'finalizada'

/**
 * Ordena conversaciones por actividad (fecha del último mensaje). `desc` deja las
 * más recientes primero (default); `asc`, las más antiguas. Las conversaciones sin
 * mensajes (fecha null) quedan siempre al final, sea cual sea la dirección. No muta
 * la entrada.
 */
export function sortConversacionesByActividad<
  T extends { ultimoMensajeFecha: string | null },
>(conversaciones: readonly T[], direccion: OrdenDireccion = 'desc'): T[] {
  const factor = direccion === 'asc' ? -1 : 1
  return [...conversaciones].sort((a, b) => {
    if (a.ultimoMensajeFecha === b.ultimoMensajeFecha) return 0
    if (a.ultimoMensajeFecha === null) return 1
    if (b.ultimoMensajeFecha === null) return -1
    return factor * b.ultimoMensajeFecha.localeCompare(a.ultimoMensajeFecha)
  })
}

/**
 * Filtra conversaciones por texto (coincide en nombre de contraparte o título de
 * proyecto) y por estado de la contratación. `estado: 'todas'` no filtra por estado;
 * texto vacío no filtra por texto. Búsqueda insensible a mayúsculas y acentos. No
 * muta la entrada.
 */
export function filtrarConversaciones<
  T extends {
    nombreContraparte: string
    tituloProyecto: string
    estado: 'contratada' | 'finalizada' | 'cancelada'
  },
>(conversaciones: readonly T[], busqueda: string, estado: EstadoFiltro): T[] {
  const q = normalizarTexto(busqueda)
  return conversaciones.filter((c) => {
    if (estado !== 'todas' && c.estado !== estado) return false
    if (!q) return true
    return (
      normalizarTexto(c.nombreContraparte).includes(q) ||
      normalizarTexto(c.tituloProyecto).includes(q)
    )
  })
}
