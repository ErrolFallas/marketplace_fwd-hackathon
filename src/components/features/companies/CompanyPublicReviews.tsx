'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { CalificacionRecibidaEmpresa } from '@/lib/company/ratings'

interface CompanyPublicReviewsProps {
  reviews: CalificacionRecibidaEmpresa[]
}

/**
 * Reseñas que el egresado ve en el perfil público de una empresa (RF-53): cada
 * reseña con su autor, estrellas, comentario y —si la empresa respondió— su
 * réplica (read-only). Espeja la sección de reseñas del perfil del egresado, del
 * otro lado. No se renderiza si la empresa no tiene reseñas.
 */
export function CompanyPublicReviews({ reviews }: CompanyPublicReviewsProps) {
  const t = useTranslations('EgresadoEmpresa')
  const locale = useLocale()

  if (reviews.length === 0) return null

  return (
    <Card className="border border-border/80 bg-card/65 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t('reviewsTitle')}
        </p>

        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id_evaluacion}
              className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {review.tituloProyecto}
                  </p>
                  <p className="text-xs font-medium text-primary">
                    {review.nombreEgresado}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= review.puntuacion
                          ? 'fill-highlight text-highlight'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comentario && (
                <p className="border-t border-border/40 pt-2 text-xs italic leading-relaxed text-muted-foreground prose-body">
                  &quot;{review.comentario}&quot;
                </p>
              )}
              {review.respuesta_evaluado && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary">
                    {t('reviewCompanyReply')}
                  </span>
                  <p className="text-xs italic leading-relaxed text-foreground/90 prose-body">
                    {review.respuesta_evaluado}
                  </p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/60">
                {new Date(review.evaluado_at).toLocaleDateString(locale)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
