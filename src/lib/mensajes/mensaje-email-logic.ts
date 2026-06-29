/** Largo máximo del recorte del mensaje que se incluye en el correo. */
export const SNIPPET_MAX_LEN = 140

/**
 * Decide si mandar correo por un mensaje nuevo (RF-46). Throttle anti-spam: solo
 * si el destinatario NO tiene ya un aviso de `mensaje_nuevo` sin leer en ese
 * hilo. Así el primer mensaje avisa por correo y los siguientes no re-mandan
 * hasta que el destinatario lo lea. Pura: el productor pasa el conteo ya resuelto.
 */
export function shouldSendMessageEmail(input: {
  priorUnreadCount: number
}): boolean {
  return input.priorUnreadCount === 0
}

/**
 * Recorta el contenido del mensaje para el snippet del correo. Colapsa espacios
 * y, si supera el máximo, corta en el último espacio razonable y agrega "…".
 */
export function truncarSnippet(
  contenido: string,
  max = SNIPPET_MAX_LEN,
): string {
  const limpio = contenido.trim().replace(/\s+/g, ' ')
  if (limpio.length <= max) return limpio
  const cortado = limpio.slice(0, max)
  const ultimoEspacio = cortado.lastIndexOf(' ')
  const base =
    ultimoEspacio > max * 0.6 ? cortado.slice(0, ultimoEspacio) : cortado
  return `${base.trimEnd()}…`
}
