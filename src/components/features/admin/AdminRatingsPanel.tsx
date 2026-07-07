'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { AdminRatingsTable, type AdminRatingRow } from './AdminRatingsTable'

type RatingDirection = 'egresado' | 'empresa'

interface AdminRatingsPanelProps {
  /** Calificaciones empresa->egresado (el egresado recibe la calificación). */
  egresadoRatings: AdminRatingRow[]
  /** Calificaciones egresado->empresa (la empresa recibe la calificación). */
  companyRatings: AdminRatingRow[]
}

/**
 * Panel de calificaciones con filtro entre las dos direcciones. Ambos conjuntos
 * llegan ya resueltos desde el servidor, así que el filtro es instantáneo en
 * cliente.
 */
export function AdminRatingsPanel({
  egresadoRatings,
  companyRatings,
}: AdminRatingsPanelProps) {
  const t = useTranslations('Admin')
  const [direction, setDirection] = useState<RatingDirection>('egresado')

  const options: { value: RatingDirection; label: string }[] = [
    { value: 'egresado', label: t('ratingsToEgresados') },
    { value: 'empresa', label: t('ratingsToCompanies') },
  ]

  const items = direction === 'egresado' ? egresadoRatings : companyRatings

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label={t('ratingsTab')}
        className="inline-flex items-center gap-1 rounded-full bg-surface-sunken p-1"
      >
        {options.map((opt) => {
          const isActive = direction === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDirection(opt.value)}
              aria-pressed={isActive}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                isActive
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <AdminRatingsTable items={items} />
    </div>
  )
}
