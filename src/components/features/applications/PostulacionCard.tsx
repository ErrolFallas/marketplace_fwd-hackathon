'use client'

import { Calendar, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { computeParticipacionProgress } from '@/lib/applications/progress-logic'
import { ParticipacionProgress } from '@/components/features/applications/ParticipacionProgress'
import type { EstadoParticipacion } from '@/lib/projects/project-detail-logic'

export interface PostulacionPropia {
  id_participacion: string
  id_proyecto: string
  projectTitle: string
  companyName: string
  /** Estado real almacenado en la BD. */
  estado: EstadoParticipacion
  /** Estado EFECTIVO de cara al estudiante (RF-32): lo que se PINTA; ver
   *  `computeEstadoParticipacionEfectivo`. */
  estadoEfectivo: EstadoParticipacion
  fecha_postulacion: string
  /** Timestamps por transición para fechar el stepper. */
  revisionIniciadaAt: string | null
  adjudicadaAt: string | null
  noSeleccionadaAt: string | null
  retiradaAt: string | null
}

const ESTADO_STYLE: Record<EstadoParticipacion, string> = {
  enviada: 'bg-primary/10 text-primary border-primary/20',
  en_revision: 'bg-warning/10 text-warning border-warning/20',
  contratada: 'bg-accent/10 text-accent border-accent/20',
  no_seleccionada: 'bg-destructive/10 text-destructive border-destructive/20',
  retirada: 'bg-muted text-muted-foreground border-border',
  finalizada: 'bg-secondary/10 text-secondary border-secondary/20',
  cancelada: 'bg-destructive/10 text-destructive border-destructive/20',
}

interface PostulacionCardProps {
  postulacion: PostulacionPropia
}

/**
 * Tarjeta compacta de "mis postulaciones": título, empresa, estado y mini-stepper
 * de progreso. Toda la tarjeta enlaza al detalle (RF-30); las acciones (retirar)
 * viven ahí para mantener la lista liviana.
 */
export function PostulacionCard({ postulacion }: PostulacionCardProps) {
  const tEgresado = useTranslations('Egresado')
  const tDetail = useTranslations('ProjectDetail')
  const locale = useLocale()

  const progress = computeParticipacionProgress(postulacion.estadoEfectivo, {
    fechaPostulacion: postulacion.fecha_postulacion,
    revisionIniciadaAt: postulacion.revisionIniciadaAt,
    adjudicadaAt: postulacion.adjudicadaAt,
    noSeleccionadaAt: postulacion.noSeleccionadaAt,
    retiradaAt: postulacion.retiradaAt,
  })

  return (
    <Link
      href={`/egresado/applications/${postulacion.id_participacion}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
      aria-label={postulacion.projectTitle}
    >
      <Card className="border border-border/80 bg-card/60 backdrop-blur-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:border-primary/40 group-hover:shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <h3 className="font-bold text-base tracking-tight text-foreground truncate">
                {postulacion.projectTitle}
              </h3>
              <p className="text-sm font-semibold text-primary font-heading truncate">
                {postulacion.companyName}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                  ESTADO_STYLE[postulacion.estadoEfectivo],
                )}
              >
                {tDetail(`pstatus_${postulacion.estadoEfectivo}`)}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(postulacion.fecha_postulacion).toLocaleDateString(
                  locale,
                )}
              </span>
            </div>
          </div>

          <ParticipacionProgress progress={progress} variant="compact" />

          <div className="flex items-center justify-end gap-1 text-xs font-semibold text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover:text-primary">
            {tEgresado('applicationViewDetail')}
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
