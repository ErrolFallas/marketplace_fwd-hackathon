'use client'

import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface RatingStarsProps {
  /** Puntaje a representar (1-5). Se redondea para el umbral de relleno. */
  value: number
  /** Clase de tamaño de cada estrella. Default `h-4 w-4`. */
  starClassName?: string
}

/**
 * Cinco estrellas de calificación con equivalente textual para lectores de
 * pantalla: el grupo lleva `role="img"` + `aria-label` con el puntaje, y las
 * estrellas individuales quedan `aria-hidden`. Único punto que dibuja estrellas
 * de reseña, para no repetir el patrón ni la accesibilidad en cada superficie.
 */
export function RatingStars({
  value,
  starClassName = 'h-4 w-4',
}: RatingStarsProps) {
  const t = useTranslations('Common')
  const filled = Math.round(value)
  return (
    <span
      role="img"
      aria-label={t('starsAria', { value })}
      className="flex shrink-0 items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          aria-hidden
          className={`${starClassName} ${
            s <= filled
              ? 'fill-highlight text-highlight'
              : 'fill-border text-border'
          }`}
        />
      ))}
    </span>
  )
}
