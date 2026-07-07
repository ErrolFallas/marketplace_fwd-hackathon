'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { ReviewCard, ReviewReply } from '@/components/features/shared'
import type { CalificacionRecibidaEmpresa } from '@/lib/company/ratings'

interface CompanyPublicReviewsProps {
  reviews: CalificacionRecibidaEmpresa[]
}

/**
 * Reseñas que el egresado ve en el perfil público de una empresa (RF-53): cada
 * reseña con su autor, estrellas, comentario y —si la empresa respondió— su
 * réplica (read-only). Reutiliza la ReviewCard del perfil del egresado, del otro
 * lado. No se renderiza si la empresa no tiene reseñas.
 */
export function CompanyPublicReviews({ reviews }: CompanyPublicReviewsProps) {
  const t = useTranslations('EgresadoEmpresa')

  if (reviews.length === 0) return null

  return (
    <Card className="border border-border/80 bg-card/65 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t('reviewsTitle')}
        </p>

        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id_evaluacion}
              tituloProyecto={review.tituloProyecto}
              nombreAutor={review.nombreEgresado}
              puntuacion={review.puntuacion}
              comentario={review.comentario}
              evaluadoAt={review.evaluado_at}
              replySlot={
                review.respuesta_evaluado ? (
                  <ReviewReply
                    label={t('reviewCompanyReply')}
                    text={review.respuesta_evaluado}
                  />
                ) : null
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
