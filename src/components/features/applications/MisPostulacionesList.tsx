'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Briefcase } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils/cn'
import { EmptyState } from '@/components/features/shared/EmptyState'
import {
  PostulacionCard,
  type PostulacionPropia,
} from '@/components/features/applications/PostulacionCard'
import type { EstadoParticipacion } from '@/lib/projects/project-detail-logic'

interface MisPostulacionesListProps {
  postulaciones: PostulacionPropia[]
}

export function MisPostulacionesList({
  postulaciones,
}: MisPostulacionesListProps) {
  const tEgresado = useTranslations('Egresado')
  const tDetail = useTranslations('ProjectDetail')

  const [filtro, setFiltro] = useState<EstadoParticipacion | 'all'>('all')

  // El universo del filtro usa el estado EFECTIVO: es lo que el egresado ve.
  const estadosPresentes = useMemo(() => {
    const set = new Set<EstadoParticipacion>()
    postulaciones.forEach((p) => set.add(p.estadoEfectivo))
    return Array.from(set)
  }, [postulaciones])

  const visibles = useMemo(
    () =>
      filtro === 'all'
        ? postulaciones
        : postulaciones.filter((p) => p.estadoEfectivo === filtro),
    [postulaciones, filtro],
  )

  if (postulaciones.length === 0) {
    return (
      <EmptyState
        title={tEgresado('emptyApplications')}
        description={tEgresado('emptyApplicationsDesc')}
        icon={Briefcase}
        actionText={tEgresado('exploreMarketplace')}
        onAction={() => {
          window.location.href = '/egresado/projects'
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {estadosPresentes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={filtro === 'all'}
            onClick={() => setFiltro('all')}
            label={tEgresado('applicationFilterAll')}
          />
          {estadosPresentes.map((estado) => (
            <FilterPill
              key={estado}
              active={filtro === estado}
              onClick={() => setFiltro(estado)}
              label={tDetail(`pstatus_${estado}`)}
            />
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tEgresado('applicationsNoneInFilter')}
        </p>
      ) : (
        <div className="space-y-4">
          {visibles.map((postulacion) => (
            <PostulacionCard
              key={postulacion.id_participacion}
              postulacion={postulacion}
            />
          ))}
        </div>
      )}

      <div className="pt-2 text-center">
        <Link
          href="/egresado/projects"
          className="text-sm font-semibold text-primary hover:underline"
        >
          {tEgresado('exploreMoreProjects')}
        </Link>
      </div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card/50 text-muted-foreground hover:border-primary/50',
      )}
    >
      {label}
    </button>
  )
}
