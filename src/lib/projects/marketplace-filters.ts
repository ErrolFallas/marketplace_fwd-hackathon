import type { WorkMode } from '@/types'

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
