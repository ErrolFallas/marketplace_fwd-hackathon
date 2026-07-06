/**
 * Normaliza un texto para búsquedas tolerantes: recorta, pasa a minúsculas y
 * elimina los diacríticos (tildes, diéresis). Así "Peña" coincide con "pena" y
 * "Cancelación" con "cancelacion", que es como la gente suele teclear en español.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}
