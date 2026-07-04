'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Project } from '@/types'
import { matchesDurationBucket } from '@/lib/projects/duration'
import {
  matchesModeSelection,
  matchesStackSelection,
  matchesBudgetRange,
  parseBudgetInput,
  type StackMatchMode,
  type BudgetRangeFilter,
} from '@/lib/projects/marketplace-filters'
import type { Currency } from '@/types'
import { EgresadoShell } from '@/components/layout/EgresadoShell'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { SearchBar } from '@/components/features/SearchBar'
import { ProjectFilters } from '@/components/features/marketplace/ProjectFilters'
import { ProjectCard } from '@/components/features/marketplace/ProjectCard'
import { EmptyState } from '@/components/features/shared/EmptyState'
import { LoadingSkeleton } from '@/components/features/shared/LoadingSkeleton'
import { Briefcase } from 'lucide-react'
import { RankingSnippet } from '@/components/features/ranking/RankingSnippet'
import { TalentRankingItem } from '@/lib/ranking/actions'

interface MarketplaceClientProps {
  initialProjects: Project[]
  topTalents?: TalentRankingItem[]
  locale: string
}

export function MarketplaceClient({
  initialProjects,
  topTalents = [],
  locale,
}: MarketplaceClientProps) {
  const tEgresado = useTranslations('Egresado')
  const tCommon = useTranslations('Common')

  const [search, setSearch] = useState('')
  const [selectedStacks, setSelectedStacks] = useState<string[]>([])
  const [stackMatchMode, setStackMatchMode] = useState<StackMatchMode>('any')
  const [selectedModes, setSelectedModes] = useState<string[]>([])
  const [selectedDuration, setSelectedDuration] = useState('')
  const [budgetCurrency, setBudgetCurrency] = useState<Currency>('USD')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [loading, setLoading] = useState(false)

  const availableStacks = useMemo(() => {
    const stacks = new Set<string>()
    initialProjects.forEach((p) => p.stack.forEach((s) => stacks.add(s)))
    return Array.from(stacks).sort()
  }, [initialProjects])

  useEffect(() => {
    const startTimer = setTimeout(() => setLoading(true), 0)
    const endTimer = setTimeout(() => setLoading(false), 400)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(endTimer)
    }
  }, [
    search,
    selectedStacks,
    stackMatchMode,
    selectedModes,
    selectedDuration,
    budgetCurrency,
    budgetMin,
    budgetMax,
  ])

  const handleClearFilters = () => {
    setSearch('')
    setSelectedStacks([])
    setStackMatchMode('any')
    setSelectedModes([])
    setSelectedDuration('')
    setBudgetCurrency('USD')
    setBudgetMin('')
    setBudgetMax('')
  }

  const filteredProjects = useMemo(() => {
    const budgetFilter: BudgetRangeFilter = {
      currency: budgetCurrency,
      min: parseBudgetInput(budgetMin),
      max: parseBudgetInput(budgetMax),
    }
    return initialProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.companyName.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase())

      const matchesStack = matchesStackSelection(
        project.stack,
        selectedStacks,
        stackMatchMode,
      )
      const matchesMode = matchesModeSelection(project.mode, selectedModes)

      const matchesDuration =
        !selectedDuration ||
        matchesDurationBucket(project.durationDays, selectedDuration)

      const matchesBudget = matchesBudgetRange(
        project.currency,
        project.budgetMin,
        project.budgetMax,
        budgetFilter,
      )

      return (
        matchesSearch &&
        matchesStack &&
        matchesMode &&
        matchesDuration &&
        matchesBudget
      )
    })
  }, [
    initialProjects,
    search,
    selectedStacks,
    stackMatchMode,
    selectedModes,
    selectedDuration,
    budgetCurrency,
    budgetMin,
    budgetMax,
  ])

  return (
    <EgresadoShell>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 min-w-0">
          <PageTitle
            title={tEgresado('marketplace')}
            description={tEgresado('marketplaceDesc')}
            dotColor="text-accent"
          />

          <div className="mt-6">
            <RankingSnippet
              topTalents={topTalents}
              rankingUrl={`/${locale}/egresado/ranking`}
            />
          </div>

          <div className="space-y-6 mt-6">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={tEgresado('searchPlaceholder')}
            />

            <ProjectFilters
              selectedStacks={selectedStacks}
              setSelectedStacks={setSelectedStacks}
              stackMatchMode={stackMatchMode}
              setStackMatchMode={setStackMatchMode}
              selectedModes={selectedModes}
              setSelectedModes={setSelectedModes}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              budgetCurrency={budgetCurrency}
              setBudgetCurrency={setBudgetCurrency}
              budgetMin={budgetMin}
              setBudgetMin={setBudgetMin}
              budgetMax={budgetMax}
              setBudgetMax={setBudgetMax}
              availableStacks={availableStacks}
              onClear={handleClearFilters}
            />

            <div className="pt-4">
              {loading ? (
                <LoadingSkeleton type="card" count={4} />
              ) : filteredProjects.length === 0 ? (
                <EmptyState
                  title={tEgresado('emptyState')}
                  description={tEgresado('emptyStateDesc')}
                  icon={Briefcase}
                  actionText={tCommon('clearFilters')}
                  onAction={handleClearFilters}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </EgresadoShell>
  )
}
