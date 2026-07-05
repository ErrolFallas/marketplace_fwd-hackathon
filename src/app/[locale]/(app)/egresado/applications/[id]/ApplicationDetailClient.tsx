'use client'

import { useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  FileText,
  GitBranch,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { ParticipacionProgress } from '@/components/features/applications/ParticipacionProgress'
import { computeParticipacionProgress } from '@/lib/applications/progress-logic'
import { retirarPostulacion } from '@/lib/applications/actions'
import type { MiPostulacionDetalle } from '@/lib/applications/queries'

interface ApplicationDetailClientProps {
  postulacion: MiPostulacionDetalle
}

export function ApplicationDetailClient({
  postulacion,
}: ApplicationDetailClientProps) {
  const t = useTranslations('Egresado')
  const tDetail = useTranslations('ProjectDetail')
  const tCommon = useTranslations('Common')
  const router = useRouter()

  const [confirmOpen, setConfirmOpen] = useState(false)
  // Doble confirmación (RF-31): paso 1 pregunta, paso 2 exige confirmar el acto
  // irreversible antes de retirar.
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const progress = computeParticipacionProgress(postulacion.estadoEfectivo, {
    fechaPostulacion: postulacion.fechaPostulacion,
    revisionIniciadaAt: postulacion.revisionIniciadaAt,
    adjudicadaAt: postulacion.adjudicadaAt,
    noSeleccionadaAt: postulacion.noSeleccionadaAt,
    retiradaAt: postulacion.retiradaAt,
  })

  const handleWithdraw = async () => {
    setIsSubmitting(true)
    const result = await retirarPostulacion({
      id_participacion: postulacion.idParticipacion,
    })
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(t('withdrawError'))
      return
    }
    setConfirmOpen(false)
    setStep(1)
    toast.success(t('withdrawSuccess'))
    router.refresh()
  }

  return (
    <div>
      <Link
        href="/egresado/applications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('applicationsBackToList')}
      </Link>

      <PageTitle
        title={postulacion.projectTitle}
        description={postulacion.companyName || t('unknownCompany')}
        dotColor="text-primary"
      />

      <div className="space-y-6">
        {(postulacion.estadoEfectivo === 'contratada' ||
          postulacion.estadoEfectivo === 'finalizada') && (
          <Card className="border border-accent/30 bg-accent/5">
            <CardContent className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="h-6 w-6 text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="font-heading text-base font-bold text-foreground">
                    {t('hiredBannerTitle')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('hiredBannerDesc')}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="accent"
                size="sm"
                className="rounded-full font-semibold shrink-0"
              >
                <Link
                  href={`/egresado/contrataciones/${postulacion.idProyecto}`}
                >
                  {t('hiredBannerCta')}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Héroe: el viaje de la oferta */}
        <Card className="border border-border/80 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('applicationProgressTitle')}
            </h2>
            <ParticipacionProgress progress={progress} variant="full" />
          </CardContent>
        </Card>

        {/* Contexto del proyecto */}
        <Card className="border border-border/80 bg-card/40">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('applicationProjectContext')}
              </p>
              <p className="mt-0.5 font-semibold text-foreground truncate">
                {postulacion.projectTitle}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-semibold shrink-0"
            >
              <Link href={`/egresado/projects/${postulacion.idProyecto}`}>
                <ArrowUpRight className="w-4 h-4" />
                {t('applicationViewProject')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recap: lo que enviaste */}
        <Card className="border border-border/80 bg-card/40">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-sm font-bold text-foreground font-heading">
              {t('applicationSubmittedTitle')}
              <span className="text-primary">.</span>
            </h2>

            {postulacion.cartaPostulacion && (
              <Field label={t('coverLetter')}>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed prose-body">
                  {postulacion.cartaPostulacion}
                </p>
              </Field>
            )}

            {postulacion.planteamientoSolucion && (
              <Field label={t('solutionApproach')}>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed prose-body">
                  {postulacion.planteamientoSolucion}
                </p>
              </Field>
            )}

            {(postulacion.prototipoEnlaces.length > 0 ||
              postulacion.urlRepositorioProyecto ||
              postulacion.tieneDocumentacion) && (
              <Field label={t('applicationAttachments')}>
                <div className="flex flex-wrap gap-2">
                  {postulacion.prototipoEnlaces.map((enlace) => (
                    <AttachmentLink
                      key={enlace}
                      href={enlace}
                      label={tDetail('prototypeLabel')}
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                    />
                  ))}
                  {postulacion.urlRepositorioProyecto && (
                    <AttachmentLink
                      href={postulacion.urlRepositorioProyecto}
                      label={tDetail('repoLabel')}
                      icon={<GitBranch className="w-3.5 h-3.5" />}
                    />
                  )}
                  {postulacion.tieneDocumentacion && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      <FileText className="w-3.5 h-3.5" />
                      {t('applicationDocAttached')}
                    </span>
                  )}
                </div>
              </Field>
            )}
          </CardContent>
        </Card>

        {/* Retirar (RF-31): solo mientras la oferta siga viva */}
        {postulacion.canWithdraw && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setStep(1)
                setConfirmOpen(true)
              }}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
            >
              <X className="w-4 h-4" />
              {t('withdrawOffer')}
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return
          setConfirmOpen(open)
          if (!open) setStep(1)
        }}
      >
        <DialogContent className="sm:max-w-md border border-border">
          {step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-heading">
                  {t('withdrawDialogTitle')}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {t('confirmWithdraw')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:justify-end pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmOpen(false)}
                  className="font-semibold"
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="magenta"
                  onClick={() => setStep(2)}
                  className="font-semibold"
                >
                  {t('withdrawContinue')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-heading">
                  {t('withdrawStep2Title')}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {t('withdrawStep2Desc')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:justify-end pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setStep(1)}
                  className="font-semibold"
                >
                  {t('withdrawBack')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="magenta"
                  disabled={isSubmitting}
                  onClick={() => void handleWithdraw()}
                  className="font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {tCommon('loading')}
                    </span>
                  ) : (
                    t('withdrawConfirmFinal')
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      <div>{children}</div>
    </div>
  )
}

function AttachmentLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]"
    >
      {icon}
      {label}
    </a>
  )
}
