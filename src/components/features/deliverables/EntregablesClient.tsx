'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CalendarDays,
  AlertCircle,
  MessageSquare,
  Star,
  Loader2,
  Link2,
  Pencil,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { actualizarUrlProyecto } from '@/lib/deliverables/actions'
import { rateCompany } from '@/lib/company/ratings'
import { addRespuestaEvaluacion } from '@/lib/evaluaciones/actions'
import type {
  MiContratacion,
  TareaEntregable,
} from '@/lib/deliverables/queries'
import { EntregablesTareas } from './EntregablesTareas'
import { ContratoCardEgresado } from './ContratoCardEgresado'

interface ReceivedRating {
  id_evaluacion: string
  puntuacion: number
  comentario: string | null
  respuesta_evaluado: string | null
}

interface EntregablesClientProps {
  projectId: string
  projectTitle: string
  companyId: string
  contratacion: MiContratacion
  tareas: TareaEntregable[]
  existingRating: { puntuacion: number; comentario: string | null } | null
  receivedRating?: ReceivedRating | null
}

export function EntregablesClient({
  projectId,
  projectTitle,
  companyId,
  contratacion,
  tareas,
  existingRating,
  receivedRating,
}: EntregablesClientProps) {
  const tEgresado = useTranslations('Egresado')
  const tCommon = useTranslations('Common')
  const router = useRouter()

  const [ratingScore, setRatingScore] = useState(
    existingRating?.puntuacion ?? 0,
  )
  const [ratingComment, setRatingComment] = useState(
    existingRating?.comentario ?? '',
  )
  const [hoverScore, setHoverScore] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [hasRated, setHasRated] = useState(existingRating !== null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [urlRepositorio, setUrlRepositorio] = useState(
    contratacion.url_repositorio_proyecto,
  )
  const [editingLink, setEditingLink] = useState(false)
  const [linkValue, setLinkValue] = useState(
    contratacion.url_repositorio_proyecto ?? '',
  )
  const [savingLink, setSavingLink] = useState(false)

  const handleSaveLink = async () => {
    const urlTrimmed = linkValue.trim() || null
    setSavingLink(true)
    const res = await actualizarUrlProyecto({
      idParticipacion: contratacion.id_participacion,
      url: urlTrimmed,
    })
    setSavingLink(false)
    if (res.ok) {
      setUrlRepositorio(urlTrimmed)
      setEditingLink(false)
      toast.success(tEgresado('projectLinkSaveSuccess'))
    } else {
      toast.error(tEgresado('projectLinkSaveError'))
    }
  }

  return (
    <EgresadoShell>
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabecera de página: ancho completo */}
        <div className="space-y-6 mb-8">
          <Link
            href={`/egresado/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
          >
            <ArrowLeft className="w-4 h-4" />
            {tEgresado('backToProjectDetail')}
          </Link>

          <PageTitle
            title={projectTitle}
            description={tEgresado('deliverablesDesc')}
            dotColor="text-primary"
            action={
              <Link
                href={`/egresado/mensajes?proyecto=${projectId}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {tCommon('openChat')}
              </Link>
            }
          />
        </div>

        <div className="mb-6">
          <ContratoCardEgresado
            idProyecto={projectId}
            estadoPeriodo={contratacion.estado_periodo}
            acuerdoAceptadoAt={contratacion.acuerdo_aceptado_at}
            montoAcordado={contratacion.monto_acordado}
            moneda={contratacion.moneda}
            condicionesEspeciales={contratacion.condiciones_especiales}
            presupuestoMin={contratacion.presupuesto_min}
            presupuestoMax={contratacion.presupuesto_max}
          />
        </div>

        {/* Barra de fechas: solo inicio/fin. El periodo vive en ContratoCardEgresado
            y el repo en el editor de la columna izquierda (se evita duplicar). */}
        {(contratacion.fecha_inicio || contratacion.fecha_fin_estimada) && (
          <Card className="border border-border/60 bg-card/30 mb-6">
            <CardContent className="px-5 py-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {contratacion.fecha_inicio && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-medium">
                      {tEgresado('contratacionInicio')}:
                    </span>
                    <span className="font-semibold text-foreground">
                      {contratacion.fecha_inicio.slice(0, 10)}
                    </span>
                  </span>
                )}
                {contratacion.fecha_fin_estimada && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="font-medium">
                      {tEgresado('contratacionFinEstimada')}:
                    </span>
                    <span className="font-semibold text-foreground">
                      {contratacion.fecha_fin_estimada.slice(0, 10)}
                    </span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de dos columnas:
            - vigente    → izq: panel de carga   | der: entregables
            - finalizado → izq: calificaciones   | der: entregables
            - pausado/cancelado → izq: aviso     | der: entregables */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[340px_1fr] lg:gap-6 lg:items-start">
          {/* ── Columna izquierda ── */}
          <div className="space-y-6">
            {/* ESTADO: vigente → panel de carga */}
            {contratacion.estado_periodo === 'vigente' && (
              <Card className="border border-border/80 bg-card/65 backdrop-blur-sm shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary via-secondary to-accent" />
                <CardContent className="p-6 pt-8 space-y-6">
                  {/* Enlace del proyecto */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-secondary" />
                      <p className="text-xs font-semibold text-foreground">
                        {tEgresado('projectLinkLabel')}
                      </p>
                    </div>

                    {editingLink ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="url"
                          value={linkValue}
                          onChange={(e) => setLinkValue(e.target.value)}
                          placeholder={tEgresado('projectLinkPlaceholder')}
                          maxLength={150}
                          disabled={savingLink}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={savingLink}
                            className="flex-1 font-semibold text-xs"
                            onClick={handleSaveLink}
                          >
                            {savingLink ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              tEgresado('projectLinkSave')
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={savingLink}
                            className="font-semibold text-xs"
                            onClick={() => {
                              setLinkValue(urlRepositorio ?? '')
                              setEditingLink(false)
                            }}
                          >
                            {tEgresado('projectLinkCancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {urlRepositorio ? (
                          <a
                            href={urlRepositorio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline underline-offset-2 truncate flex-1 hover:text-primary/80 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                          >
                            {urlRepositorio}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/70 flex-1">
                            {tEgresado('projectLinkEmpty')}
                          </span>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="shrink-0 h-7 w-7 p-0"
                          onClick={() => {
                            setLinkValue(urlRepositorio ?? '')
                            setEditingLink(true)
                          }}
                          aria-label={tEgresado('projectLinkEdit')}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ESTADO: finalizado → cards de calificación */}
            {contratacion.estado_periodo === 'finalizado' && (
              <>
                {/* Calificación de la Empresa */}
                <Card className="border border-border/80 bg-card/65 backdrop-blur-sm shadow-md overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-warning to-highlight" />
                  <CardContent className="p-6 pt-8 space-y-6">
                    <div className="space-y-1 text-left">
                      <h3 className="text-base font-extrabold font-heading text-foreground">
                        {tEgresado('rateCompanyTitle')}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tEgresado('rateCompanyDesc')}
                      </p>
                    </div>

                    {hasRated ? (
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-muted-foreground mr-2">
                            {tEgresado('ratingLabel')}:
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= ratingScore
                                    ? 'text-highlight fill-highlight'
                                    : 'text-muted-foreground/25'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {ratingComment && (
                          <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2 text-xs text-foreground/90">
                            <span className="font-bold block mb-1 text-muted-foreground uppercase text-[10px]">
                              {tEgresado('commentLabel')}
                            </span>
                            {ratingComment}
                          </div>
                        )}
                        <p className="text-xs text-accent font-semibold">
                          {tEgresado('alreadyRated')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground">
                            {tEgresado('ratingLabel')} *
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                disabled={submittingRating}
                                onMouseEnter={() => setHoverScore(star)}
                                onMouseLeave={() => setHoverScore(0)}
                                onClick={() => setRatingScore(star)}
                                className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= (hoverScore || ratingScore)
                                      ? 'text-highlight fill-highlight'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="rating-comment"
                            className="block text-xs font-bold text-muted-foreground"
                          >
                            {tEgresado('commentLabel')}
                          </label>
                          <textarea
                            id="rating-comment"
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder={tEgresado('rateCompanyDesc')}
                            disabled={submittingRating}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            maxLength={1000}
                          />
                        </div>

                        <Button
                          type="button"
                          disabled={submittingRating || ratingScore === 0}
                          onClick={async () => {
                            if (ratingScore === 0) return
                            setSubmittingRating(true)
                            const res = await rateCompany({
                              idEmpresario: companyId,
                              idContratacion: contratacion.id_contratacion,
                              puntuacion: ratingScore,
                              comentario: ratingComment.trim() || undefined,
                            })
                            setSubmittingRating(false)
                            if (res.ok) {
                              toast.success(tEgresado('rateCompanySuccess'))
                              setHasRated(true)
                              router.refresh()
                            } else {
                              toast.error(res.error)
                            }
                          }}
                          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs flex items-center gap-1.5"
                        >
                          {submittingRating && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          )}
                          {tEgresado('submitRating')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Calificación recibida del empresario (RF-49 + RF-53 réplica) */}
                <Card className="border border-border/80 bg-card/65 backdrop-blur-sm shadow-md overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-accent to-primary" />
                  <CardContent className="p-6 pt-8 space-y-6">
                    <div className="space-y-1 text-left">
                      <h3 className="text-base font-extrabold font-heading text-foreground">
                        {tEgresado('receivedRatingTitle')}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tEgresado('receivedRatingDesc')}
                      </p>
                    </div>

                    {receivedRating ? (
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-muted-foreground mr-2">
                            {tEgresado('ratingLabel')}:
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= receivedRating.puntuacion
                                    ? 'text-highlight fill-highlight'
                                    : 'text-muted-foreground/25'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {receivedRating.comentario && (
                          <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2 text-xs text-foreground/90">
                            <span className="font-bold block mb-1 text-muted-foreground uppercase text-[10px]">
                              {tEgresado('commentLabel')}
                            </span>
                            {receivedRating.comentario}
                          </div>
                        )}
                        {receivedRating.respuesta_evaluado ? (
                          <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-foreground/90">
                            <span className="font-bold block mb-1 text-primary uppercase text-[10px]">
                              {tEgresado('alreadyReplied')}
                            </span>
                            {receivedRating.respuesta_evaluado}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label
                              htmlFor="reply-comment"
                              className="block text-xs font-bold text-muted-foreground"
                            >
                              {tEgresado('replyLabel')}
                            </label>
                            <textarea
                              id="reply-comment"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={tEgresado('replyPlaceholder')}
                              disabled={submittingReply}
                              rows={3}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              maxLength={1000}
                            />
                            <Button
                              type="button"
                              disabled={
                                submittingReply || replyText.trim() === ''
                              }
                              onClick={async () => {
                                if (replyText.trim() === '') return
                                setSubmittingReply(true)
                                const res = await addRespuestaEvaluacion({
                                  idEvaluacion: receivedRating.id_evaluacion,
                                  respuesta: replyText.trim(),
                                })
                                setSubmittingReply(false)
                                if (res.ok) {
                                  toast.success(tEgresado('replySuccess'))
                                  router.refresh()
                                } else {
                                  toast.error(tEgresado('replyError'))
                                }
                              }}
                              className="text-xs font-semibold flex items-center gap-1.5"
                            >
                              {submittingReply && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              )}
                              {submittingReply
                                ? tEgresado('replySubmitting')
                                : tEgresado('replySubmit')}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {tEgresado('receivedRatingNone')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ESTADO: pausado / cancelado → aviso sin panel de carga */}
            {contratacion.estado_periodo !== 'vigente' &&
              contratacion.estado_periodo !== 'finalizado' && (
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {tEgresado('uploadDisabledNotVigente')}
                </div>
              )}
          </div>

          {/* ── Columna derecha: tareas y propuestas ── */}
          <div>
            <EntregablesTareas
              rol="egresado"
              idProyecto={projectId}
              tareas={tareas}
              canManage={contratacion.estado_periodo === 'vigente'}
            />
          </div>
        </div>
      </div>
    </EgresadoShell>
  )
}
