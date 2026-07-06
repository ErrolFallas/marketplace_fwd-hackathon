'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import {
  RepublicarProyectoButton,
  ProyectoRepublicadoLink,
} from './RepublicarProyectoButton'

interface RepublicarProyectoCardProps {
  idProyecto: string
  republicadoA: string | null
  plazoOriginalDias: number
}

/**
 * Card del empresario en una contratación cancelada. Si el proyecto todavía no se
 * republicó, ofrece el botón (elige plazo, copia exacta con id nuevo). Si ya se
 * republicó (columna `republicado_a`), muestra el enlace al proyecto nuevo en vez
 * del botón — no se puede republicar dos veces por la misma cancelación.
 */
export function RepublicarProyectoCard({
  idProyecto,
  republicadoA,
  plazoOriginalDias,
}: RepublicarProyectoCardProps) {
  const t = useTranslations('Contrataciones')

  return (
    <Card className="border border-border bg-card/40">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {republicadoA !== null
              ? t('yaRepublicado')
              : t('republicarCardTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {republicadoA !== null
              ? t('yaRepublicadoDesc')
              : t('republicarCardDesc')}
          </p>
        </div>
        {republicadoA !== null ? (
          <ProyectoRepublicadoLink
            idNuevo={republicadoA}
            className="shrink-0"
          />
        ) : (
          <RepublicarProyectoButton
            idProyecto={idProyecto}
            plazoOriginalDias={plazoOriginalDias}
            className="shrink-0"
          />
        )}
      </CardContent>
    </Card>
  )
}
