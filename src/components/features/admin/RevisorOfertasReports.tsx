'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Briefcase, ScanSearch } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/features/shared/EmptyState'
import { SupervisorFeedbackCard } from '@/components/features/marketplace/SupervisorFeedbackCard'
import type { PostulacionRevisadaIaItem } from '@/lib/admin/queries'

interface RevisorOfertasReportsProps {
  items: PostulacionRevisadaIaItem[]
}

/**
 * Cola de moderación del revisor IA de ofertas: postulaciones que el agente
 * rechazó o donde detectó un intento de manipulación. Solo lectura (el revisor es
 * advisory). Reusa SupervisorFeedbackCard para renderizar el veredicto por-campo.
 */
export function RevisorOfertasReports({ items }: RevisorOfertasReportsProps) {
  const t = useTranslations('Admin')
  const locale = useLocale()

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('revisorOfertasEmpty')}
        description={t('revisorOfertasEmptyDesc')}
        icon={ScanSearch}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('revisorOfertasCount', { count: items.length })}
      </div>
      {items.map((item) => (
        <Card
          key={item.idParticipacion}
          className="border border-border/80 bg-surface"
        >
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {item.estudianteNombre || t('revisorOfertasSinNombre')}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.proyectoTitulo}</span>
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(item.fechaPostulacion).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <SupervisorFeedbackCard
              resultado={{
                estado: item.estado,
                modelo: null,
                detalle: item.detalle,
                contentHash: '',
              }}
              loading={false}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
