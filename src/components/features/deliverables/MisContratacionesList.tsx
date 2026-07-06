'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Briefcase, Building2, CalendarDays } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/features/shared/EmptyState'
import { SearchInput } from '@/components/features/shared/SearchInput'
import { filtrarPorTexto } from '@/lib/utils/filtrar-por-texto'
import type { ContratacionResumen } from '@/lib/deliverables/queries'

interface MisContratacionesListProps {
  contrataciones: ContratacionResumen[]
}

type FiltroEstado = 'all' | 'vigente' | 'finalizado' | 'pausado' | 'cancelado'

const ESTADO_PERIODO_KEYS: Record<string, string> = {
  vigente: 'contractActive',
  finalizado: 'contractFinished',
  pausado: 'contractPaused',
  cancelado: 'contractCancelled',
}

const ESTADO_PERIODO_COLORS: Record<string, string> = {
  vigente: 'text-accent border-accent/40 bg-accent/10',
  finalizado: 'text-primary border-primary/40 bg-primary/10',
  pausado: 'text-warning border-warning/40 bg-warning/10',
  cancelado: 'text-magenta border-magenta/40 bg-magenta/10',
}

export function MisContratacionesList({
  contrataciones,
}: MisContratacionesListProps) {
  const tEgresado = useTranslations('Egresado')
  const tCommon = useTranslations('Common')
  const [filtro, setFiltro] = useState<FiltroEstado>('all')
  const [busqueda, setBusqueda] = useState('')

  const estadosPresentes = Array.from(
    new Set(contrataciones.map((c) => c.estado_periodo)),
  ) as FiltroEstado[]

  const filtros: { key: FiltroEstado; labelKey: string }[] = [
    { key: 'all', labelKey: 'contractFilterAll' },
    ...estadosPresentes.map((estado) => ({
      key: estado,
      labelKey: ESTADO_PERIODO_KEYS[estado] ?? 'contractActive',
    })),
  ]

  const porEstado =
    filtro === 'all'
      ? contrataciones
      : contrataciones.filter((c) => c.estado_periodo === filtro)
  const visibles = filtrarPorTexto(
    porEstado,
    busqueda,
    (c) => `${c.titulo_proyecto} ${c.nombre_empresa ?? ''}`,
  )

  if (contrataciones.length === 0) {
    return (
      <EmptyState
        title={tEgresado('emptyContracts')}
        description={tEgresado('emptyContractsDesc')}
        icon={Briefcase}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={busqueda}
        onChange={setBusqueda}
        placeholder={tEgresado('contractSearchPlaceholder')}
      />
      {/* Filtros por estado */}
      <div className="flex items-center gap-2 flex-wrap">
        {filtros.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFiltro(key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
              filtro === key
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {tEgresado(labelKey as Parameters<typeof tEgresado>[0])}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {visibles.length} / {contrataciones.length}
        </span>
      </div>

      {/* Lista filtrada */}
      {visibles.length === 0 ? (
        <div className="p-10 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-card/20">
          <Briefcase className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            {tEgresado('contractFilterEmpty')}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((c) => {
            const estadoKey =
              ESTADO_PERIODO_KEYS[c.estado_periodo] ?? 'contractActive'
            const estadoColor =
              ESTADO_PERIODO_COLORS[c.estado_periodo] ??
              'text-muted-foreground border-border bg-muted/20'

            return (
              <li key={c.id_contratacion}>
                <Card className="border border-border/80 bg-card/65 backdrop-blur-sm shadow-md h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                          {c.titulo_proyecto}
                        </p>
                        {c.nombre_empresa && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{c.nombre_empresa}</span>
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${estadoColor}`}
                      >
                        {tEgresado(
                          estadoKey as Parameters<typeof tEgresado>[0],
                        )}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {c.fecha_inicio && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                          {tEgresado('contractStart')}:{' '}
                          {new Date(c.fecha_inicio).toLocaleDateString()}
                        </p>
                      )}
                      {c.fecha_fin_estimada && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                          {tEgresado('contractEnd')}:{' '}
                          {new Date(c.fecha_fin_estimada).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                      <Button
                        asChild
                        variant="accent"
                        size="sm"
                        className="w-full font-semibold gap-1.5 rounded-full"
                      >
                        <Link
                          href={`/egresado/contrataciones/${c.id_proyecto}`}
                        >
                          <Briefcase className="w-4 h-4" />
                          {tCommon('workspace')}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full font-semibold gap-1.5 text-muted-foreground"
                      >
                        <Link href={`/egresado/empresa/${c.id_empresario}`}>
                          <Building2 className="w-4 h-4" />
                          {tEgresado('viewCompanyProfile')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
