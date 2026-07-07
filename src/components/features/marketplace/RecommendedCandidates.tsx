'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'
import { ChevronDown, Loader2, UserPlus, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { invitarEgresado } from '@/lib/invitaciones/actions'
import type { RecommendedCandidate } from '@/lib/projects/match-actions'

interface RecommendedCandidatesProps {
  projectId: string
  candidates: RecommendedCandidate[]
}

/** Candidatos visibles antes de "Ver los N". */
const TOP_VISIBLE = 5

export function RecommendedCandidates({
  projectId,
  candidates,
}: RecommendedCandidatesProps) {
  const t = useTranslations('ProjectDetail')
  const [expanded, setExpanded] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [invitedIds, setInvitedIds] = useState<ReadonlySet<string>>(new Set())

  const visibleCandidates = expanded
    ? candidates
    : candidates.slice(0, TOP_VISIBLE)
  const canExpand = candidates.length > TOP_VISIBLE

  async function handleInvite(idEstudiante: string, nombre: string) {
    setPendingId(idEstudiante)
    const result = await invitarEgresado({
      idProyecto: projectId,
      idEstudiante,
    })
    setPendingId(null)
    if (result.ok) {
      setInvitedIds((prev) => new Set(prev).add(idEstudiante))
      toast.success(t('recommendedInviteSuccess', { name: nombre }))
    } else {
      // 'ya_invitado' es un no-op benigno: marcarlo como invitado igual.
      if (result.error === 'ya_invitado') {
        setInvitedIds((prev) => new Set(prev).add(idEstudiante))
      }
      toast.error(t('recommendedInviteError'))
    }
  }

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
              {visibleCandidates.map((candidate) => {
                const invited =
                  candidate.yaInvitado || invitedIds.has(candidate.idEstudiante)
                const pending = pendingId === candidate.idEstudiante

                return (
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
                          {candidate.nombreCompleto
                            .substring(0, 2)
                            .toUpperCase()}
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
                        className="hidden w-20 shrink-0 flex-col items-end gap-1 sm:flex"
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
                        <Link
                          href={`/empresario/ranking/${candidate.idEstudiante}`}
                          className="whitespace-nowrap rounded-md px-2 py-1 text-sm font-semibold text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {t('recommendedViewProfile')}
                        </Link>

                        {candidate.yaParticipa ? (
                          <span className="whitespace-nowrap rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                            {t('recommendedAlreadyParticipating')}
                          </span>
                        ) : invited ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('recommendedInvited')}
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() =>
                              handleInvite(
                                candidate.idEstudiante,
                                candidate.nombreCompleto,
                              )
                            }
                          >
                            {pending ? (
                              <Loader2
                                className="h-4 w-4 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <UserPlus
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            )}
                            {t('recommendedInvite')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
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
