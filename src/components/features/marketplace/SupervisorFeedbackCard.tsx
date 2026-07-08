'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  ShieldAlert,
  Loader2,
} from 'lucide-react'
import type {
  RevisionResultado,
  RevisionItem,
} from '@/lib/ai-filtro-ofertas/types'

interface SupervisorFeedbackCardProps {
  resultado: RevisionResultado | null
  loading: boolean
}

type Estilo = {
  titleKey:
    | 'supervisorApprovedTitle'
    | 'supervisorRejectedTitle'
    | 'supervisorUnavailableTitle'
  descKey:
    | 'supervisorApprovedDesc'
    | 'supervisorRejectedDesc'
    | 'supervisorUnavailableDesc'
  Icon: typeof CheckCircle2
  pill: string
  bar: string
}

const ESTILOS: Record<'aprobada' | 'rechazada' | 'nd', Estilo> = {
  aprobada: {
    titleKey: 'supervisorApprovedTitle',
    descKey: 'supervisorApprovedDesc',
    Icon: CheckCircle2,
    pill: 'bg-accent/15 text-accent border-accent/30',
    bar: 'bg-accent',
  },
  rechazada: {
    titleKey: 'supervisorRejectedTitle',
    descKey: 'supervisorRejectedDesc',
    Icon: AlertTriangle,
    pill: 'bg-warning/15 text-warning border-warning/30',
    bar: 'bg-warning',
  },
  nd: {
    titleKey: 'supervisorUnavailableTitle',
    descKey: 'supervisorUnavailableDesc',
    Icon: Info,
    pill: 'bg-muted text-muted-foreground border-border',
    bar: 'bg-muted-foreground/40',
  },
}

/**
 * "Comentario de nuestro supervisor": muestra el veredicto advisory del revisor IA
 * con coaching por-campo. NO bloquea el envío. Solo renderiza códigos del catálogo
 * traducidos por i18n, nunca texto libre del modelo.
 */
export function SupervisorFeedbackCard({
  resultado,
  loading,
}: SupervisorFeedbackCardProps) {
  const t = useTranslations('Egresado')

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/50 px-4 py-3 text-sm font-semibold text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {t('reviewLoading')}
      </div>
    )
  }

  if (!resultado) return null

  const clave =
    resultado.estado === 'aprobada'
      ? 'aprobada'
      : resultado.estado === 'rechazada'
        ? 'rechazada'
        : 'nd'
  const estilo = ESTILOS[clave]
  const bloqueantes = resultado.detalle.items.filter(
    (i) => i.tipo === 'bloqueante',
  )
  const sugerencias = resultado.detalle.items.filter(
    (i) => i.tipo === 'sugerencia',
  )

  return (
    <Card className="relative overflow-hidden border border-border/80 bg-card/65">
      <div className={`absolute left-0 top-0 h-full w-[3px] ${estilo.bar}`} />
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">
            {t('supervisorTitle')}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${estilo.pill}`}
          >
            <estilo.Icon className="h-3.5 w-3.5" />
            {t(estilo.titleKey)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{t(estilo.descKey)}</p>

        {resultado.detalle.intentoManipulacion && (
          <p className="flex items-start gap-2 rounded-lg border border-magenta/30 bg-magenta/10 px-3 py-2 text-xs font-semibold text-magenta">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {t('supervisorManipulationWarning')}
          </p>
        )}

        {bloqueantes.length > 0 && (
          <ItemGroup
            title={t('supervisorBlockersTitle')}
            items={bloqueantes}
            tone="magenta"
            campoLabel={(campo) => t(`revisorCampo_${campo}`)}
            itemLabel={(codigo) => t(`revisorMotivo_${codigo}`)}
            Icon={AlertTriangle}
          />
        )}

        {sugerencias.length > 0 && (
          <ItemGroup
            title={t('supervisorSuggestionsTitle')}
            items={sugerencias}
            tone="highlight"
            campoLabel={(campo) => t(`revisorCampo_${campo}`)}
            itemLabel={(codigo) => t(`revisorSugerencia_${codigo}`)}
            Icon={Lightbulb}
          />
        )}
      </CardContent>
    </Card>
  )
}

interface ItemGroupProps {
  title: string
  items: RevisionItem[]
  tone: 'magenta' | 'highlight'
  campoLabel: (campo: RevisionItem['campo']) => string
  itemLabel: (codigo: string) => string
  Icon: typeof CheckCircle2
}

function ItemGroup({
  title,
  items,
  tone,
  campoLabel,
  itemLabel,
  Icon,
}: ItemGroupProps) {
  const iconTone = tone === 'magenta' ? 'text-magenta' : 'text-highlight'
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${iconTone}`} />
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={`${item.tipo}-${item.codigo}-${index}`}
            className="rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm"
          >
            <span className="font-semibold text-foreground">
              {campoLabel(item.campo)}:
            </span>{' '}
            <span className="text-muted-foreground">
              {itemLabel(item.codigo)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
