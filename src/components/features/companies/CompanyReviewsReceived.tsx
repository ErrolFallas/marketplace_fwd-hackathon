'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import type { CalificacionRecibidaEmpresa } from '@/lib/company/ratings'

interface CompanyReviewsReceivedProps {
  reviews: CalificacionRecibidaEmpresa[]
}

/**
 * Lista de calificaciones que la empresa recibió de los egresados. Espeja la
 * sección "Calificaciones recibidas" del perfil del egresado (ProfileView): cada
 * reseña muestra el proyecto, quién la dejó, las estrellas, el comentario y la
 * fecha. Presentacional: los datos llegan resueltos desde el server.
 */
export function CompanyReviewsReceived({
  reviews,
}: CompanyReviewsReceivedProps) {
  const t = useTranslations('EmpresaPerfil')
  const locale = useLocale()

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 md:p-8 space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-display">
        {t('ratingsReceivedTitle')}
      </p>

      {reviews.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">
          {t('ratingsReceivedEmpty')}
        </p>
      ) : (
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
              <p className="text-[10px] text-muted-foreground/60">
                {new Date(review.evaluado_at).toLocaleDateString(locale)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
