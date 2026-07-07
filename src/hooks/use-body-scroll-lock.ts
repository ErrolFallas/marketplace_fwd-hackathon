import { useEffect } from 'react'

/**
 * Bloquea el scroll del body mientras `locked` es true. Lo necesitan los
 * drawers móviles armados a mano (sin Radix Dialog/Sheet, que ya hacen esto
 * solos): sin esto, arrastrar el dedo dentro del drawer hace scroll-chaining
 * a la página de atrás, y como los navegadores móviles cambian el alto del
 * viewport al ocultar la barra de URL durante ese scroll, el overlay
 * `fixed inset-0` queda un instante sin cubrir todo y se ve un corte brusco
 * del contenido de atrás.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [locked])
}
