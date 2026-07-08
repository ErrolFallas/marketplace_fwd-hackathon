'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { useAccountStatus } from '@/components/features/auth/AccountStatusContext'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { SupervisorFeedbackCard } from '@/components/features/marketplace/SupervisorFeedbackCard'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Send,
  FileText,
  Link2,
  Plus,
  X,
  Sparkles,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { postularse, revisarPostulacionConIA } from '@/lib/applications/actions'
import type { RevisionResultado } from '@/lib/ai-filtro-ofertas/types'

const MAX_CARTA_LEN = 2800
const MIN_PLANTEAMIENTO_LEN = 30
const MAX_ENLACE_LEN = 500
const MAX_ENLACES_EXTRA = 3

type ApplyFormValues = zod.infer<ReturnType<typeof createApplySchema>>

function createApplySchema(
  t: ReturnType<typeof useTranslations<'Validation'>>,
) {
  return zod.object({
    // Carta OPCIONAL (el SRS no la exige): solo se topa el máximo.
    coverLetter: zod
      .string()
      .max(MAX_CARTA_LEN, { message: t('coverLetterMax') }),
    planteamientoSolucion: zod
      .string()
      .min(MIN_PLANTEAMIENTO_LEN, { message: t('solutionApproachMin') }),
    prototipoUrl: zod
      .string()
      .min(1, { message: t('prototypeRequired') })
      .url({ message: t('linkInvalid') })
      .max(MAX_ENLACE_LEN, { message: t('linkMax') }),
    enlacesExtra: zod
      .array(
        zod.object({
          value: zod
            .string()
            .url({ message: t('linkInvalid') })
            .max(MAX_ENLACE_LEN, { message: t('linkMax') })
            .or(zod.literal('')),
        }),
      )
      .max(MAX_ENLACES_EXTRA),
    // Documento técnico OPCIONAL (RF-30 Should).
    documentacionTecnica: zod.custom<FileList>(),
  })
}

interface ApplyProjectClientProps {
  projectId: string
  projectTitle: string
  projectCompanyName: string
}

export function ApplyProjectClient({
  projectId,
  projectTitle,
  projectCompanyName,
}: ApplyProjectClientProps) {
  const router = useRouter()
  const tCommon = useTranslations('Common')
  const tEgresado = useTranslations('Egresado')
  const tValidation = useTranslations('Validation')
  const tAccount = useTranslations('Account')

  const { isPending } = useAccountStatus()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [revisando, setRevisando] = useState(false)
  const [revision, setRevision] = useState<RevisionResultado | null>(null)
  const [consintioPi, setConsintioPi] = useState(false)
  const [consintioIa, setConsintioIa] = useState(false)

  const applySchema = useMemo(
    () => createApplySchema(tValidation),
    [tValidation],
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      coverLetter: '',
      planteamientoSolucion: '',
      prototipoUrl: '',
      enlacesExtra: [],
      // documentacionTecnica is uncontrolled for type="file"
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'enlacesExtra',
  })

  const planteamiento = watch('planteamientoSolucion')
  const carta = watch('coverLetter')

  // Editar el texto invalida la revisión previa: el veredicto debe corresponder
  // exactamente a lo que se enviará (el servidor lo coteja por hash).
  useEffect(() => {
    setRevision(null)
  }, [planteamiento, carta])

  const handleRevisar = async () => {
    if (!planteamiento || planteamiento.trim().length < MIN_PLANTEAMIENTO_LEN) {
      toast.error(tValidation('solutionApproachMin'))
      return
    }
    setRevisando(true)
    try {
      const res = await revisarPostulacionConIA({
        id_proyecto: projectId,
        planteamiento_solucion: planteamiento,
        carta_postulacion: carta.trim().length > 0 ? carta.trim() : undefined,
      })
      if (res.ok) {
        setRevision(res.data)
      } else {
        toast.error(tEgresado('applyError'))
      }
    } catch {
      toast.error(tEgresado('unexpectedError'))
    } finally {
      setRevisando(false)
    }
  }

  const onSubmit = async (data: ApplyFormValues) => {
    setIsSubmitting(true)

    try {
      const extras = data.enlacesExtra
        .map((enlace) => enlace.value.trim())
        .filter((value) => value.length > 0)
      const prototipoEnlaces = [data.prototipoUrl.trim(), ...extras]

      const formData = new FormData()
      formData.append('id_proyecto', projectId)
      formData.append('planteamiento_solucion', data.planteamientoSolucion)
      formData.append('carta_postulacion', data.coverLetter.trim())
      formData.append('prototipo_enlaces', JSON.stringify(prototipoEnlaces))
      formData.append('consentimiento_pi', consintioPi ? 'true' : 'false')
      formData.append('consentimiento_ia', consintioIa ? 'true' : 'false')
      if (revision) {
        formData.append('revision_ia', JSON.stringify(revision))
      }
      const file = data.documentacionTecnica?.[0]
      if (file) {
        formData.append('file', file)
      }

      const result = await postularse(formData)

      if (!result.ok) {
        const errorMessages: Partial<Record<string, string>> = {
          consentimiento_requerido: tEgresado('applyErrorConsentimiento'),
          link_invalido: tEgresado('applyErrorLinkInvalido'),
          link_sin_respuesta: tEgresado('applyErrorLinkSinRespuesta'),
          cuenta_no_verificada: tEgresado('applyErrorCuentaNoVerificada'),
          cupo_excedido: tEgresado('applyErrorCupoExcedido'),
          proyecto_cerrado: tEgresado('applyErrorProyectoCerrado'),
          plazo_vencido: tEgresado('applyErrorPlazoVencido'),
          proyecto_not_found: tEgresado('applyErrorProyectoCerrado'),
          estudiante_not_found: tEgresado('applyErrorPerfil'),
          unauthenticated: tEgresado('applyErrorSesion'),
          database_error: tEgresado('applyErrorDatabase'),
          archivo_muy_grande: tEgresado('applyErrorArchivoGrande'),
          tipo_archivo_invalido: tEgresado('applyErrorArchivoTipo'),
          storage_error: tEgresado('applyErrorArchivoSubida'),
        }
        toast.error(
          errorMessages[String(result.error)] ?? tEgresado('applyError'),
        )
      } else {
        toast.success(tEgresado('applySuccess'))
        router.push('/egresado/applications')
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : tEgresado('unexpectedError'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const puedeEnviar = consintioPi && consintioIa && !isSubmitting && !isPending

  return (
    <EgresadoShell>
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/egresado/projects/${projectId}`}
            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            {tEgresado('backToProjectDetail')}
          </Link>
        </div>

        <PageTitle
          title={tEgresado('applyFormTitle')}
          description={tEgresado('applyFormProjectInfo', {
            title: projectTitle,
            company: projectCompanyName,
          })}
          dotColor="text-primary"
        />

        <Card className="border border-border/80 bg-card/65 backdrop-blur-sm shadow-md overflow-hidden relative mt-6">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary via-secondary to-accent" />
          <CardContent className="p-6 pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="planteamientoSolucion"
                  className="text-sm font-bold flex justify-between"
                >
                  <span>
                    {tEgresado('solutionApproach')}{' '}
                    <span className="text-magenta">{tCommon('required')}</span>
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {tCommon('minCharsLabel', { n: MIN_PLANTEAMIENTO_LEN })}
                  </span>
                </Label>
                <Textarea
                  id="planteamientoSolucion"
                  rows={4}
                  placeholder={tEgresado('solutionApproachPlaceholder')}
                  className={`bg-card/50 border-border ${errors.planteamientoSolucion ? 'border-destructive' : 'focus-visible:ring-primary'}`}
                  {...register('planteamientoSolucion')}
                />
                {errors.planteamientoSolucion && (
                  <p className="text-xs font-semibold text-destructive">
                    {errors.planteamientoSolucion.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="prototipoUrl"
                  className="text-sm font-bold flex items-center gap-1.5"
                >
                  <Link2 className="w-4 h-4 text-primary" />
                  {tEgresado('prototypeUrlLabel')}{' '}
                  <span className="text-magenta">{tCommon('required')}</span>
                </Label>
                <Input
                  id="prototipoUrl"
                  type="url"
                  placeholder="https://..."
                  className={`bg-card/50 border-border ${errors.prototipoUrl ? 'border-destructive' : 'focus-visible:ring-primary'}`}
                  {...register('prototipoUrl')}
                />
                <p className="text-xs text-muted-foreground">
                  {tEgresado('prototypeUrlHelp')}
                </p>
                {errors.prototipoUrl && (
                  <p className="text-xs font-semibold text-destructive">
                    {errors.prototipoUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-secondary" />
                  {tEgresado('prototypeExtraLabel')}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {tCommon('optional')}
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  {tEgresado('prototypeExtraHelp')}
                </p>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          type="url"
                          placeholder="https://..."
                          aria-label={tEgresado('prototypeExtraLabel')}
                          className={`bg-card/50 border-border ${errors.enlacesExtra?.[index]?.value ? 'border-destructive' : 'focus-visible:ring-primary'}`}
                          {...register(`enlacesExtra.${index}.value`)}
                        />
                        {errors.enlacesExtra?.[index]?.value && (
                          <p className="mt-1 text-xs font-semibold text-destructive">
                            {errors.enlacesExtra[index]?.value?.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label={tEgresado('removeLinkAria')}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {fields.length < MAX_ENLACES_EXTRA && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: '' })}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {tEgresado('addLink')}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="coverLetter"
                  className="text-sm font-bold flex justify-between"
                >
                  <span>
                    {tEgresado('coverLetter')}{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      {tCommon('optional')}
                    </span>
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {tCommon('maxCharsLabel', { n: MAX_CARTA_LEN })}
                  </span>
                </Label>
                <Textarea
                  id="coverLetter"
                  rows={6}
                  placeholder={tEgresado('coverLetterPlaceholder')}
                  className={`bg-card/50 border-border ${errors.coverLetter ? 'border-destructive' : 'focus-visible:ring-primary'}`}
                  {...register('coverLetter')}
                />
                {errors.coverLetter && (
                  <p className="text-xs font-semibold text-destructive">
                    {errors.coverLetter.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="documentacionTecnica"
                  className="text-sm font-bold flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-accent" />
                  {tEgresado('technicalDocUrlLabel')}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {tCommon('optional')}
                  </span>
                </Label>
                <Input
                  id="documentacionTecnica"
                  type="file"
                  accept=".pdf,.zip"
                  className={`bg-card/50 border-border ${errors.documentacionTecnica ? 'border-destructive' : 'focus-visible:ring-primary'}`}
                  {...register('documentacionTecnica')}
                />
                <p className="text-xs text-muted-foreground">
                  {tEgresado('technicalDocUrlHelp')}
                </p>
                {errors.documentacionTecnica?.message && (
                  <p className="text-xs font-semibold text-destructive">
                    {String(errors.documentacionTecnica.message)}
                  </p>
                )}
              </div>

              {/* Revisor IA (advisory): "comentario de nuestro supervisor". No
                  bloquea el envío; da coaching antes de postular. */}
              <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">
                      {tEgresado('supervisorTitle')}
                    </p>
                    {!revision && (
                      <p className="text-xs text-muted-foreground">
                        {tEgresado('reviewMustReview')}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRevisar}
                    disabled={revisando}
                    className="flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    {revision
                      ? tEgresado('reviewCtaAgain')
                      : tEgresado('reviewCta')}
                  </Button>
                </div>
                <SupervisorFeedbackCard
                  resultado={revision}
                  loading={revisando}
                />
              </div>

              {/* Consentimientos obligatorios (bloquean el envío). */}
              <div className="space-y-3 rounded-xl border border-border/70 bg-card/40 p-4">
                <label className="flex items-start gap-2.5 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={consintioPi}
                    onChange={(e) => setConsintioPi(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                  />
                  <span>{tEgresado('consentPiLabel')}</span>
                </label>
                <label className="flex items-start gap-2.5 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={consintioIa}
                    onChange={(e) => setConsintioIa(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                  />
                  <span>{tEgresado('consentIaLabel')}</span>
                </label>
              </div>

              {isPending && (
                <p className="text-xs font-semibold text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
                  {tAccount('actionDisabledPending')}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
                <Link
                  href={`/egresado/projects/${projectId}`}
                  className="border border-border bg-background text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg text-sm font-semibold h-8 px-3"
                >
                  {tCommon('cancel')}
                </Link>
                <Button
                  type="submit"
                  disabled={!puedeEnviar}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center gap-1.5 shadow-sm px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? tCommon('loading') : tCommon('submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </EgresadoShell>
  )
}
