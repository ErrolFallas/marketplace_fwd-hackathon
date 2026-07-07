'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ReviewCard, ReviewReply } from '@/components/features/shared'
import {
  addRespuestaEvaluacionEmpresario,
  type CalificacionRecibidaEmpresa,
} from '@/lib/company/ratings'

interface CompanyReviewsReceivedProps {
  reviews: CalificacionRecibidaEmpresa[]
}

/**
 * Cuadro de réplica del empresario a UNA reseña (RF-53 bidireccional). Si ya
 * respondió, muestra la réplica read-only (ReviewReply); si no, un textarea +
 * botón que llama a `addRespuestaEvaluacionEmpresario`.
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
      <ReviewReply
        label={t('ratingReplyTitle')}
        text={review.respuesta_evaluado}
      />
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
 * Lista de calificaciones que la empresa recibió de los egresados. Reutiliza la
 * ReviewCard del perfil del egresado (mismo estilo); cada reseña incluye un cuadro
 * de réplica (RF-53). Los datos llegan resueltos desde el server.
 */
export function CompanyReviewsReceived({
  reviews,
}: CompanyReviewsReceivedProps) {
  const t = useTranslations('EmpresaPerfil')

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
            <ReviewCard
              key={review.id_evaluacion}
              tituloProyecto={review.tituloProyecto}
              nombreAutor={review.nombreEgresado}
              puntuacion={review.puntuacion}
              comentario={review.comentario}
              evaluadoAt={review.evaluado_at}
              replySlot={<CompanyReviewReplyBox review={review} />}
            />
          ))}
        </div>
      )}
    </section>
  )
}
