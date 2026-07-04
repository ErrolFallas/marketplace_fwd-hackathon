'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { ComboboxOption } from '@/components/ui/combobox'

interface MultiSelectProps {
  options: ComboboxOption[]
  /** Códigos seleccionados. */
  selected: string[]
  onSelectedChange: (next: string[]) => void
  /** Texto del disparador (siempre visible; a su lado va el conteo). */
  placeholder: string
  /** Si se pasa, se muestra el buscador dentro del panel (listas largas). */
  searchPlaceholder?: string
  /** Texto cuando la búsqueda no encuentra coincidencias (con buscador). */
  emptyText?: string
  /** Prefijo del `aria-label` del botón que quita un chip (ej. "Quitar"). */
  removeLabel: string
  id?: string
}

/**
 * Selección múltiple con búsqueda (Popover + cmdk + chips). Espejo multi del
 * `Combobox`: el panel no se cierra al elegir, así se marcan varias opciones;
 * las elegidas se muestran como chips removibles debajo. Navegable por teclado
 * (DoD §11.5). El buscador es opcional: se activa solo si hay muchas opciones.
 */
export function MultiSelect({
  options,
  selected,
  onSelectedChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  removeLabel,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const toggle = (value: string) => {
    onSelectedChange(
      selected.includes(value)
        ? selected.filter((code) => code !== value)
        : [...selected, value],
    )
  }

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value),
  )

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            id={id}
            aria-expanded={open}
            className="bg-card/50 border-border w-full justify-between font-normal"
          >
            <span
              className={cn(
                'truncate',
                selected.length === 0 && 'text-muted-foreground',
              )}
            >
              {placeholder}
            </span>
            <span className="flex items-center gap-1.5">
              {selected.length > 0 && (
                <Badge variant="secondary" className="tabular-nums">
                  {selected.length}
                </Badge>
              )}
              <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command>
            {searchPlaceholder ? (
              <CommandInput placeholder={searchPlaceholder} />
            ) : null}
            <CommandList>
              {emptyText ? <CommandEmpty>{emptyText}</CommandEmpty> : null}
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      onSelect={() => toggle(option.value)}
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-60',
                        )}
                      >
                        {isSelected ? (
                          <CheckIcon className="size-3 text-primary-foreground" />
                        ) : null}
                      </span>
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {option.label}
              <button
                type="button"
                onClick={() => toggle(option.value)}
                aria-label={`${removeLabel} ${option.label}`}
                className="rounded-full text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
