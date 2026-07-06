'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { RepublicarProyectoButton } from './RepublicarProyectoButton'

interface RepublicarProyectoCardProps {
  idProyecto: string
}

/**
 * Card del empresario en una contratación cancelada: explica el estado y ofrece
 * republicar el proyecto (copia exacta, id nuevo). El botón + confirmación viven
 * en {@link RepublicarProyectoButton}, compartido con la lista de proyectos.
 */
export function RepublicarProyectoCard({
  idProyecto,
}: RepublicarProyectoCardProps) {
  const t = useTranslations('Contrataciones')

  return (
    <Card className="border border-border bg-card/40">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t('republicarCardTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('republicarCardDesc')}
          </p>
        </div>
        <RepublicarProyectoButton
          idProyecto={idProyecto}
          className="shrink-0"
        />
      </CardContent>
    </Card>
  )
}
