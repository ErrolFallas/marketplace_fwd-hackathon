import { normalizarTexto } from './normalizar-texto'

/**
 * Filtra una lista por coincidencia de subcadena en el texto que expone
 * `getTexto`, de forma insensible a mayúsculas y acentos (ver normalizarTexto).
 * Una búsqueda vacía no filtra. No muta la entrada.
 */
export function filtrarPorTexto<T>(
  items: readonly T[],
  busqueda: string,
  getTexto: (item: T) => string,
): T[] {
  const consulta = normalizarTexto(busqueda)
  if (consulta === '') return [...items]
  return items.filter((item) =>
    normalizarTexto(getTexto(item)).includes(consulta),
  )
}
