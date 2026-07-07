import type { Currency, WorkMode } from '@/types'

/**
 * Predicados PUROS del filtro del marketplace (tecnologías y modalidad). Se
 * mantienen fuera del componente para que UI y lógica no se desincronicen y la
 * combinación OR/AND sea testeable, igual que `matchesDurationBucket`.
 */

/**
 * Modo de coincidencia del filtro de tecnologías.
 * `any` = el proyecto trae AL MENOS UNA de las seleccionadas (OR).
 * `all` = el proyecto trae TODAS las seleccionadas (AND).
 */
export type StackMatchMode = 'any' | 'all'

/**
 * ¿El stack del proyecto satisface la selección de tecnologías? Selección vacía
 * = sin filtro (matchea todo). Con `all`, cada tecnología seleccionada debe
 * estar en el stack; con `any`, basta una coincidencia.
 */
export function matchesStackSelection(
  projectStack: readonly string[],
  selectedStacks: readonly string[],
  matchMode: StackMatchMode,
): boolean {
  if (selectedStacks.length === 0) return true
  if (matchMode === 'all') {
    return selectedStacks.every((stack) => projectStack.includes(stack))
  }
  return selectedStacks.some((stack) => projectStack.includes(stack))
}

/**
 * ¿La modalidad del proyecto está entre las seleccionadas? Siempre OR: un
 * proyecto tiene UNA sola modalidad, así que "todas" nunca tendría sentido.
 * Selección vacía = sin filtro.
 */
export function matchesModeSelection(
  projectMode: WorkMode,
  selectedModes: readonly string[],
): boolean {
  if (selectedModes.length === 0) return true
  return selectedModes.includes(projectMode)
}

/**
 * Filtro de presupuesto en UNA moneda (sin conversión). `min`/`max` son las
 * cotas "Desde"/"Hasta"; `null` en cualquiera = ese lado queda abierto.
 */
export interface BudgetRangeFilter {
  currency: Currency
  min: number | null
  max: number | null
}

/** El filtro está activo si el usuario fijó al menos una cota. */
export function isBudgetFilterActive(filter: BudgetRangeFilter): boolean {
  return filter.min !== null || filter.max !== null
}

/**
 * Convierte el texto de un input a número no negativo. Vacío, negativo o no
 * numérico → `null` (ese lado del rango queda abierto). Genérico: lo usan el
 * filtro de presupuesto y el de días hasta el cierre.
 */
export function parseNonNegativeInput(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

/**
 * ¿El presupuesto del proyecto satisface el filtro? Sin filtro activo → matchea.
 * Con filtro activo, la moneda del proyecto debe coincidir con la del filtro
 * (nunca se convierte) y el rango [min..max] del proyecto debe SOLAPAR con
 * [desde..hasta]. Un proyecto sin ninguna cota de presupuesto no matchea un
 * filtro activo.
 */
export function matchesBudgetRange(
  projectCurrency: Currency,
  projectMin: number | null,
  projectMax: number | null,
  filter: BudgetRangeFilter,
): boolean {
  if (!isBudgetFilterActive(filter)) return true
  if (projectCurrency !== filter.currency) return false

  const projectLow = projectMin ?? projectMax
  const projectHigh = projectMax ?? projectMin
  if (projectLow === null || projectHigh === null) return false

  const filterLow = filter.min ?? 0
  const filterHigh = filter.max ?? Number.POSITIVE_INFINITY
  return projectHigh >= filterLow && projectLow <= filterHigh
}

const MS_POR_DIA = 86_400_000

/**
 * ¿El proyecto cierra dentro del rango [minDays, maxDays] de días contados desde
 * `now`? A diferencia de la duración (ventana fija), es dinámico. `now` (ms
 * epoch) se inyecta para mantener la función pura y testeable. Sin rango (min y
 * max en null) → pasa todo. Un proyecto sin fecha, con fecha inválida o YA
 * vencido (días negativos) no matchea un rango activo. Extremos abiertos: min
 * null = sin piso, max null = sin techo.
 */
export function matchesClosingWithinDays(
  closingDate: string | null,
  minDays: number | null,
  maxDays: number | null,
  now: number,
): boolean {
  if (minDays === null && maxDays === null) return true
  if (closingDate === null) return false
  const closeMs = new Date(closingDate).getTime()
  if (!Number.isFinite(closeMs)) return false

  const daysUntilClose = Math.ceil((closeMs - now) / MS_POR_DIA)
  if (daysUntilClose < 0) return false

  const low = minDays ?? 0
  const high = maxDays ?? Number.POSITIVE_INFINITY
  return daysUntilClose >= low && daysUntilClose <= high
}
