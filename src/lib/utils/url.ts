/**
 * Extrae el hostname legible de una URL para mostrarlo al usuario
 * (p. ej. "https://perronstore.com/tienda" -> "perronstore.com"). Quita el
 * prefijo "www." por prolijidad.
 *
 * El try/catch NO silencia un error: `new URL` lanza ante una cadena que no es
 * una URL absoluta, y la decisión explícita es devolver null para que el
 * llamador aplique su propio fallback (p. ej. mostrar la cadena cruda).
 */
export function extractHostname(url: string): string | null {
  try {
    const { hostname } = new URL(url)
    return hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
