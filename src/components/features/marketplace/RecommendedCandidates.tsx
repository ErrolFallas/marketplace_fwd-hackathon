'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { RecommendedCandidate } from '@/lib/projects/match-actions'

interface RecommendedCandidatesProps {
  candidates: RecommendedCandidate[]
}

/** Candidatos visibles antes de "Ver los N". */
const TOP_VISIBLE = 5

export function RecommendedCandidates({
  candidates,
}: RecommendedCandidatesProps) {
  const t = useTranslations('ProjectDetail')
  const [expanded, setExpanded] = useState(false)

  const visibleCandidates = expanded
    ? candidates
    : candidates.slice(0, TOP_VISIBLE)
  const canExpand = candidates.length > TOP_VISIBLE

  return (
    <Card className="border border-border/80 bg-card/60 backdrop-blur-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-foreground">
            {t('recommendedTitle')}
            <span className="text-secondary">.</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('recommendedDesc')}
          </p>
        </div>

        {candidates.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            {t('recommendedEmpty')}
          </p>
        ) : (
          <>
            <ol className="space-y-1">
              {visibleCandidates.map((candidate) => (
                <li key={candidate.idEstudiante}>
                  <div className="-mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-muted/50">
                    {candidate.fotoPerfil ? (
                      <Image
                        src={candidate.fotoPerfil}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                        {candidate.nombreCompleto.substring(0, 2).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {candidate.nombreCompleto}
                      </span>
                      {candidate.tituloFwd && (
                        <span className="block truncate text-xs capitalize text-muted-foreground">
                          {candidate.tituloFwd}
                        </span>
                      )}
                    </div>

                    <div
                      className="hidden w-24 shrink-0 flex-col items-end gap-1 sm:flex"
                      aria-label={t('recommendedAffinity', {
                        score: candidate.matchScore,
                      })}
                    >
                      <span className="text-sm font-bold text-primary">
                        {candidate.matchScore}%
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${candidate.matchScore}%` }}
                        />
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {candidate.yaParticipa && (
                        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                          {t('recommendedAlreadyParticipating')}
                        </span>
                      )}
                      <Link
                        href={`/empresario/ranking/${candidate.idEstudiante}`}
                        className="whitespace-nowrap rounded-md px-2 py-1 text-sm font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {t('recommendedViewProfile')}
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {canExpand && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {expanded
                  ? t('recommendedShowLess')
                  : t('recommendedShowAll', { count: candidates.length })}
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] motion-reduce:transition-none ${
                    expanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
