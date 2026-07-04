'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterX } from 'lucide-react'
import { DURATION_BUCKET_BOUNDS } from '@/lib/projects/duration'
import type { StackMatchMode } from '@/lib/projects/marketplace-filters'

interface ProjectFiltersProps {
  selectedStacks: string[]
  setSelectedStacks: (val: string[]) => void
  stackMatchMode: StackMatchMode
  setStackMatchMode: (val: StackMatchMode) => void
  selectedModes: string[]
  setSelectedModes: (val: string[]) => void
  selectedDuration: string
  setSelectedDuration: (val: string) => void
  selectedBudget: string
  setSelectedBudget: (val: string) => void
  availableStacks: string[]
  onClear: () => void
}

export function ProjectFilters({
  selectedStacks,
  setSelectedStacks,
  stackMatchMode,
  setStackMatchMode,
  selectedModes,
  setSelectedModes,
  selectedDuration,
  setSelectedDuration,
  selectedBudget,
  setSelectedBudget,
  availableStacks,
  onClear,
}: ProjectFiltersProps) {
  const tCommon = useTranslations('Common')
  const tEgresado = useTranslations('Egresado')

  const { shortMax, mediumMax } = DURATION_BUCKET_BOUNDS

  const stackOptions = availableStacks.map((stack) => ({
    value: stack,
    label: stack,
  }))

  const modeOptions = [
    { value: 'remoto', label: tCommon('remoto') },
    { value: 'hibrido', label: tCommon('hibrido') },
    { value: 'presencial', label: tCommon('presencial') },
  ]

  const showClearBtn =
    selectedStacks.length > 0 ||
    selectedModes.length > 0 ||
    Boolean(selectedDuration) ||
    Boolean(selectedBudget)

  return (
    <div className="flex flex-col gap-4 p-4 border border-border rounded-xl bg-card/40 backdrop-blur-sm shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {tEgresado('selectStack')}
          </label>
          <MultiSelect
            options={stackOptions}
            selected={selectedStacks}
            onSelectedChange={setSelectedStacks}
            placeholder={tEgresado('selectStack')}
            searchPlaceholder={tEgresado('stackSearchPlaceholder')}
            emptyText={tEgresado('noStackMatch')}
            removeLabel={tEgresado('removeFilter')}
          />
          {selectedStacks.length >= 2 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">
                {tEgresado('matchLabel')}
              </span>
              <div className="inline-flex rounded-full border border-border p-0.5">
                <Button
                  type="button"
                  size="xs"
                  variant={stackMatchMode === 'any' ? 'default' : 'ghost'}
                  onClick={() => setStackMatchMode('any')}
                  className="rounded-full"
                >
                  {tEgresado('matchAny')}
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant={stackMatchMode === 'all' ? 'default' : 'ghost'}
                  onClick={() => setStackMatchMode('all')}
                  className="rounded-full"
                >
                  {tEgresado('matchAll')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {tEgresado('selectMode')}
          </label>
          <MultiSelect
            options={modeOptions}
            selected={selectedModes}
            onSelectedChange={setSelectedModes}
            placeholder={tEgresado('selectMode')}
            removeLabel={tEgresado('removeFilter')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {tEgresado('selectDuration')}
          </label>
          <Select
            value={selectedDuration || 'all'}
            onValueChange={(val) =>
              setSelectedDuration(val === 'all' || !val ? '' : val)
            }
          >
            <SelectTrigger className="w-full h-10 bg-card border-border hover:border-primary/40 focus:ring-primary">
              <SelectValue placeholder={tEgresado('selectDuration')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon('clearFilters')}</SelectItem>
              <SelectItem value="short">
                {`1 - ${shortMax} ${tCommon('days')}`}
              </SelectItem>
              <SelectItem value="medium">
                {`${shortMax + 1} - ${mediumMax} ${tCommon('days')}`}
              </SelectItem>
              <SelectItem value="long">
                {`${mediumMax + 1}+ ${tCommon('days')}`}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {tEgresado('selectBudget')}
          </label>
          <Select
            value={selectedBudget || 'all'}
            onValueChange={(val) =>
              setSelectedBudget(val === 'all' || !val ? '' : val)
            }
          >
            <SelectTrigger className="w-full h-10 bg-card border-border hover:border-primary/40 focus:ring-primary">
              <SelectValue placeholder={tEgresado('selectBudget')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon('clearFilters')}</SelectItem>
              <SelectItem value="low">&lt; 500 USD</SelectItem>
              <SelectItem value="mid">500 - 800 USD</SelectItem>
              <SelectItem value="high">800+ USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showClearBtn && (
        <div className="flex justify-end pt-2 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive flex items-center gap-1.5"
          >
            <FilterX className="w-4 h-4" />
            {tCommon('clearFilters')}
          </Button>
        </div>
      )}
    </div>
  )
}
