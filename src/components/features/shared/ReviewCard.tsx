'use client'

import type { ReactNode } from 'react'
import { useLocale } from 'next-intl'
import { RatingStars } from './RatingStars'

interface ReviewCardProps {
  /** Título del proyecto al que corresponde la reseña. */
  tituloProyecto: string
  /** Nombre del evaluador (empresa o egresado); la atribución es visible. */
  nombreAutor: string
  /** Puntaje 1-5 de la reseña. */
  puntuacion: number
  comentario: string | null
  /** Fecha de la evaluación (ISO). */
  evaluadoAt: string
  /** Réplica ya renderizada (read-only vía `ReviewReply` o editable). */
  replySlot?: ReactNode
}

/**
 * Tarjeta de reseña unificada para las tres superficies (perfil del egresado,
 * perfil de empresa visto por egresado, reseñas recibidas por la empresa). Usa el
 * estilo de la credencial del egresado (acento `highlight` + fondo hundido). La
 * réplica se inyecta por slot para soportar la variante read-only y la editable.
 */
export function ReviewCard({
  tituloProyecto,
  nombreAutor,
  puntuacion,
  comentario,
  evaluadoAt,
  replySlot,
}: ReviewCardProps) {
  const locale = useLocale()
  return (
    <div className="space-y-2.5 rounded-xl border border-border border-l-[3px] border-l-highlight bg-surface-sunken p-4 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-primary/30 hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-bold text-foreground">
            {tituloProyecto}
          </p>
          <p className="text-xs font-semibold text-primary">{nombreAutor}</p>
        </div>
        <RatingStars value={puntuacion} />
      </div>
      {comentario && (
        <p className="border-t border-border/50 pt-2.5 text-xs italic leading-relaxed text-muted-foreground prose-body">
          &quot;{comentario}&quot;
        </p>
      )}
      {replySlot}
      <p className="text-[10px] text-muted-foreground/60 tabular-nums">
        {new Date(evaluadoAt).toLocaleDateString(locale)}
      </p>
    </div>
  )
}
