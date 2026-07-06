'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Star, ChevronDown } from 'lucide-react'

export interface RankingWidgetEntry {
  id: string
  nombre: string
  imagenUrl: string | null
  reputacion: number
  etiquetas: string[]
  perfilHref: string
}

interface RankingWidgetProps {
  title: string
  /** Clase de token para el punto azul firma del título (p. ej. `text-primary`). */
  dotColor: string
  /** Entradas ya ordenadas y acotadas al tope por la capa de datos. */
  entries: RankingWidgetEntry[]
  emptyLabel: string
}

/** Posiciones visibles antes de pulsar "Ver más". */
const TOP_VISIBLE = 3
/** Máximo de etiquetas (tecnologías) por fila. */
const MAX_TAGS = 3

export function RankingWidget({
  title,
  dotColor,
  entries,
  emptyLabel,
}: RankingWidgetProps) {
  const t = useTranslations('Ranking')
  const [expanded, setExpanded] = useState(false)

  const visibleEntries = expanded ? entries : entries.slice(0, TOP_VISIBLE)
  const canExpand = entries.length > TOP_VISIBLE

  return (
    <section className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-4 font-heading text-lg font-bold tracking-tight text-foreground">
        {title}
        <span className={dotColor}>.</span>
      </h2>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ol className="space-y-1">
          {visibleEntries.map((entry, index) => {
            const rank = index + 1
            const isLead = rank === 1

            return (
              <li key={entry.id}>
                <Link
                  href={entry.perfilHref}
                  className="group -mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 -skew-x-6 items-center justify-center rounded-md text-sm font-bold ${
                      isLead
                        ? 'bg-highlight text-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <span className="skew-x-6">{rank}</span>
                  </span>

                  {entry.imagenUrl ? (
                    <Image
                      src={entry.imagenUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                      {entry.nombre.substring(0, 2).toUpperCase()}
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {entry.nombre}
                    </span>
                    {entry.etiquetas.length > 0 && (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {entry.etiquetas.slice(0, MAX_TAGS).join(' · ')}
                      </span>
                    )}
                  </span>

                  <span
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground"
                    aria-label={t('ratingLabel', {
                      rating: entry.reputacion.toFixed(1),
                    })}
                  >
                    <Star
                      aria-hidden="true"
                      className="h-4 w-4 fill-highlight text-highlight"
                    />
                    {entry.reputacion.toFixed(1)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      )}

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center justify-center gap-1 self-start rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? t('viewLess') : t('viewMore')}
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] motion-reduce:transition-none ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}
    </section>
  )
}
