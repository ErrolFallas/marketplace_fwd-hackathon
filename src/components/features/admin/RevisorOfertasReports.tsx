'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Briefcase, ScanSearch, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/features/shared/EmptyState'
import { SupervisorFeedbackCard } from '@/components/features/marketplace/SupervisorFeedbackCard'
import { regenerarVeredictosPendientes } from '@/lib/admin/backfill-veredictos'
import type { PostulacionRevisadaIaItem } from '@/lib/admin/queries'

interface RevisorOfertasReportsProps {
  items: PostulacionRevisadaIaItem[]
}

/**
 * Cola de moderación del revisor IA de ofertas: postulaciones que el agente
 * rechazó o donde detectó un intento de manipulación. Solo lectura (el revisor es
 * advisory). Incluye un backfill para regenerar el veredicto de las postulaciones
 * históricas que quedaron sin revisar. Reusa SupervisorFeedbackCard.
 */
export function RevisorOfertasReports({ items }: RevisorOfertasReportsProps) {
  const t = useTranslations('Admin')
  const locale = useLocale()
  const [regenerando, setRegenerando] = useState(false)

  const handleRegenerar = async () => {
    setRegenerando(true)
    try {
      const res = await regenerarVeredictosPendientes()
      if (res.ok) {
        toast.success(t('revisorOfertasBackfillOk', { n: res.data.procesadas }))
      } else {
        toast.error(t('revisorOfertasBackfillError'))
      }
    } catch {
      toast.error(t('revisorOfertasBackfillError'))
    } finally {
      setRegenerando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">
          {t('revisorOfertasBackfillHint')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRegenerar}
          disabled={regenerando}
          className="flex items-center gap-1.5"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${regenerando ? 'animate-spin' : ''}`}
          />
          {t('revisorOfertasBackfillCta')}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={t('revisorOfertasEmpty')}
          description={t('revisorOfertasEmptyDesc')}
          icon={ScanSearch}
        />
      ) : (
        <>
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
                    {new Date(item.fechaPostulacion).toLocaleDateString(
                      locale,
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      },
                    )}
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
        </>
      )}
    </div>
  )
}
