'use client'

import { Check, ChevronRight, Minus, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { EstadoParticipacion } from '@/lib/projects/project-detail-logic'
import type {
  ParticipacionOutcome,
  ParticipacionProgress as Progreso,
  ProgressStep,
} from '@/lib/applications/progress-logic'

interface ParticipacionProgressProps {
  progress: Progreso
  variant: 'compact' | 'full'
}

/**
 * Elemento firma de las postulaciones del egresado: el "viaje" de la oferta como
 * un stepper fast-forward (Enviada -> En revisión -> Resultado) con bifurcación
 * final. El color del desenlace lo dicta `outcome`, no el hito: adjudicada=accent,
 * rechazada=magenta, retirada/cancelada=neutro. Ver `computeParticipacionProgress`.
 */
export function ParticipacionProgress({
  progress,
  variant,
}: ParticipacionProgressProps) {
  if (variant === 'compact') {
    return <CompactProgress progress={progress} />
  }
  return <FullProgress progress={progress} />
}

/* -------------------------------------------------------------------------- */
/* Variante detalle: stepper horizontal con etiquetas, fechas y chevrons FWD.  */
/* -------------------------------------------------------------------------- */

function FullProgress({ progress }: { progress: Progreso }) {
  const { steps, outcome } = progress
  const [step0, step1, step2] = steps

  return (
    <div className="w-full">
      <div className="flex items-center">
        <StepCircle step={step0} outcome={outcome} />
        <Connector prev={step0} intoResultado={false} outcome={outcome} />
        <StepCircle step={step1} outcome={outcome} />
        <Connector prev={step1} intoResultado outcome={outcome} />
        <StepCircle step={step2} outcome={outcome} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StepLabel
          step={step0}
          outcome={outcome}
          resultadoEstado={progress.resultadoEstado}
          align="left"
        />
        <StepLabel
          step={step1}
          outcome={outcome}
          resultadoEstado={progress.resultadoEstado}
          align="center"
        />
        <StepLabel
          step={step2}
          outcome={outcome}
          resultadoEstado={progress.resultadoEstado}
          align="right"
        />
      </div>
    </div>
  )
}

function StepCircle({
  step,
  outcome,
}: {
  step: ProgressStep
  outcome: ParticipacionOutcome
}) {
  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)]',
        circleClasses(step, outcome),
      )}
    >
      <StepGlyph step={step} outcome={outcome} />
    </span>
  )
}

function Connector({
  prev,
  intoResultado,
  outcome,
}: {
  prev: ProgressStep
  intoResultado: boolean
  outcome: ParticipacionOutcome
}) {
  const active = prev.status === 'done'
  const { line, chevron } = connectorClasses(active, intoResultado, outcome)
  return (
    <span className="flex flex-1 items-center px-1.5">
      <span className={cn('h-0.5 flex-1 rounded-full', line)} />
      <ChevronRight className={cn('-ml-1 h-4 w-4 shrink-0', chevron)} />
    </span>
  )
}

function StepLabel({
  step,
  outcome,
  resultadoEstado,
  align,
}: {
  step: ProgressStep
  outcome: ParticipacionOutcome
  resultadoEstado: EstadoParticipacion | null
  align: 'left' | 'center' | 'right'
}) {
  const t = useTranslations('Egresado')
  const tp = useTranslations('ProjectDetail')
  const locale = useLocale()
  const alignClass =
    align === 'left'
      ? 'text-left items-start'
      : align === 'right'
        ? 'text-right items-end'
        : 'text-center items-center'

  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', alignClass)}>
      <p
        className={cn(
          'text-xs font-bold tracking-tight font-heading',
          labelColor(step, outcome),
        )}
      >
        {stepTitle(step, outcome, resultadoEstado, t, tp)}
      </p>
      <p className="text-[11px] leading-snug text-muted-foreground">
        {stepHint(step, resultadoEstado, t)}
      </p>
      {step.date && (
        <p className="text-[10px] font-medium text-muted-foreground/80 tabular-nums">
          {new Date(step.date).toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
          })}
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Variante lista: tres segmentos + leyenda, para la tarjeta compacta.         */
/* -------------------------------------------------------------------------- */

function CompactProgress({ progress }: { progress: Progreso }) {
  const { steps, outcome } = progress
  const t = useTranslations('Egresado')
  const tp = useTranslations('ProjectDetail')

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        {steps.map((step) => (
          <span
            key={step.key}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)]',
              segmentClasses(step, outcome),
            )}
          />
        ))}
      </div>
      <p className={cn('text-[11px] font-semibold', captionColor(outcome))}>
        {captionText(steps, outcome, progress.resultadoEstado, t, tp)}
      </p>
    </div>
  )
}

/* --------------------------------- glyphs --------------------------------- */

function StepGlyph({
  step,
  outcome,
}: {
  step: ProgressStep
  outcome: ParticipacionOutcome
}) {
  if (step.key === 'resultado') {
    if (step.status === 'done') return <Check className="h-5 w-5" />
    if (step.status === 'failed') {
      return outcome === 'negative' ? (
        <X className="h-5 w-5" />
      ) : (
        <Minus className="h-5 w-5" />
      )
    }
    return <Dot />
  }
  if (step.status === 'done') return <Check className="h-5 w-5" />
  if (step.status === 'current') return <Dot filled />
  return <Dot />
}

function Dot({ filled = false }: { filled?: boolean }) {
  return (
    <span
      className={cn(
        'block h-2.5 w-2.5 rounded-full',
        filled ? 'bg-current' : 'border-2 border-current opacity-60',
      )}
    />
  )
}

/* -------------------------------- classes --------------------------------- */

function circleClasses(
  step: ProgressStep,
  outcome: ParticipacionOutcome,
): string {
  if (step.key === 'resultado') {
    if (step.status === 'done') {
      return 'bg-accent text-accent-foreground border-accent'
    }
    if (step.status === 'failed') {
      return outcome === 'negative'
        ? 'bg-magenta text-magenta-foreground border-magenta'
        : 'bg-muted text-muted-foreground border-border'
    }
    return 'bg-muted text-muted-foreground border-border'
  }
  if (step.status === 'current') {
    return 'bg-primary text-primary-foreground border-primary'
  }
  if (step.status === 'done') {
    return 'bg-primary/15 text-primary border-primary/30'
  }
  return 'bg-muted text-muted-foreground border-border'
}

function connectorClasses(
  active: boolean,
  intoResultado: boolean,
  outcome: ParticipacionOutcome,
): { line: string; chevron: string } {
  if (!active) return { line: 'bg-border', chevron: 'text-border' }
  if (!intoResultado) return { line: 'bg-primary', chevron: 'text-primary' }
  if (outcome === 'positive')
    return { line: 'bg-accent', chevron: 'text-accent' }
  if (outcome === 'negative') {
    return { line: 'bg-magenta', chevron: 'text-magenta' }
  }
  if (outcome === 'aborted') {
    return {
      line: 'bg-muted-foreground/40',
      chevron: 'text-muted-foreground/50',
    }
  }
  return { line: 'bg-primary', chevron: 'text-primary' }
}

function segmentClasses(
  step: ProgressStep,
  outcome: ParticipacionOutcome,
): string {
  if (step.key === 'resultado') {
    if (step.status === 'done') return 'bg-accent'
    if (step.status === 'failed') {
      return outcome === 'negative' ? 'bg-magenta' : 'bg-muted-foreground/40'
    }
    return 'bg-border'
  }
  if (step.status === 'done') return 'bg-primary'
  if (step.status === 'current') return 'bg-primary/60'
  return 'bg-border'
}

function labelColor(step: ProgressStep, outcome: ParticipacionOutcome): string {
  if (step.key === 'resultado') {
    if (outcome === 'positive') return 'text-accent'
    if (outcome === 'negative') return 'text-magenta'
    return 'text-muted-foreground'
  }
  return step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
}

function captionColor(outcome: ParticipacionOutcome): string {
  if (outcome === 'positive') return 'text-accent'
  if (outcome === 'negative') return 'text-magenta'
  if (outcome === 'aborted') return 'text-muted-foreground'
  return 'text-primary'
}

/* --------------------------------- copy ----------------------------------- */

type Translate = ReturnType<typeof useTranslations>

function stepTitle(
  step: ProgressStep,
  outcome: ParticipacionOutcome,
  resultadoEstado: EstadoParticipacion | null,
  t: Translate,
  tp: Translate,
): string {
  if (step.key === 'enviada') return t('progressEnviada')
  if (step.key === 'en_revision') return t('progressRevision')
  // resultado: si ya hay desenlace, se etiqueta con su pstatus real
  // (distingue contratada/finalizada); mientras sigue pendiente, "Resultado".
  if (resultadoEstado === null) return t('progressResultado')
  return tp(`pstatus_${resultadoEstado}`)
}

function stepHint(
  step: ProgressStep,
  resultadoEstado: EstadoParticipacion | null,
  t: Translate,
): string {
  if (step.key === 'enviada') return t('progressEnviadaHint')
  if (step.key === 'en_revision') return t('progressRevisionHint')
  // resultado: hint específico por desenlace; null = aún pendiente.
  switch (resultadoEstado) {
    case 'contratada':
      return t('progressResultContratadaHint')
    case 'finalizada':
      return t('progressResultFinalizadaHint')
    case 'no_seleccionada':
      return t('progressResultNegativeHint')
    case 'retirada':
      return t('progressResultRetiradaHint')
    case 'cancelada':
      return t('progressResultCanceladaHint')
    default:
      return t('progressResultadoPending')
  }
}

function captionText(
  steps: Progreso['steps'],
  outcome: ParticipacionOutcome,
  resultadoEstado: EstadoParticipacion | null,
  t: Translate,
  tp: Translate,
): string {
  if (outcome === 'pending') {
    const current = steps.find((s) => s.status === 'current')
    return current?.key === 'en_revision'
      ? t('progressRevision')
      : t('progressEnviada')
  }
  return stepTitle(steps[2], outcome, resultadoEstado, t, tp)
}
