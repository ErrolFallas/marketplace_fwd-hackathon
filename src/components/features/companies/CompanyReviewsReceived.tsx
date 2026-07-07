'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  addRespuestaEvaluacionEmpresario,
  type CalificacionRecibidaEmpresa,
} from '@/lib/company/ratings'

interface CompanyReviewsReceivedProps {
  reviews: CalificacionRecibidaEmpresa[]
}

/**
 * Cuadro de réplica del empresario a UNA reseña (RF-53 bidireccional). Si ya
 * respondió, muestra la réplica read-only; si no, un textarea + botón que llama a
 * `addRespuestaEvaluacionEmpresario`. Comportamiento idéntico al del egresado.
 */
function CompanyReviewReplyBox({
  review,
}: {
  review: CalificacionRecibidaEmpresa
}) {
  const t = useTranslations('EmpresaPerfil')
  const router = useRouter()
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (review.respuesta_evaluado) {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary">
          {t('ratingReplyTitle')}
        </span>
        <p className="text-xs italic leading-relaxed text-foreground/90 prose-body">
          {review.respuesta_evaluado}
        </p>
      </div>
    )
  }

  const handleReply = async () => {
    if (replyText.trim() === '') return
    setSubmitting(true)
    const res = await addRespuestaEvaluacionEmpresario({
      idEvaluacion: review.id_evaluacion,
      respuesta: replyText.trim(),
    })
    setSubmitting(false)
    if (res.ok) {
      toast.success(t('ratingReplySaved'))
      router.refresh()
    } else {
      toast.error(t('ratingReplyError'))
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder={t('ratingReplyPlaceholder')}
        rows={2}
        maxLength={1000}
        className="resize-none text-xs"
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="accent"
          onClick={() => void handleReply()}
          disabled={submitting || replyText.trim() === ''}
          className="rounded-full text-xs font-semibold"
        >
          {t('ratingReplyBtn')}
        </Button>
      </div>
    </div>
  )
}

/**
 * Lista de calificaciones que la empresa recibió de los egresados. Espeja la
 * sección "Calificaciones recibidas" del perfil del egresado (ProfileView): cada
 * reseña muestra el proyecto, quién la dejó, las estrellas, el comentario, la
 * fecha y un cuadro de réplica (RF-53). Los datos llegan resueltos desde el server.
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
              <CompanyReviewReplyBox review={review} />
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
