import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel?: string
}

/**
 * Buscador de texto reutilizable: input con icono, insensible a acentos del lado
 * del consumidor. Calca el patrón del buscador de mensajes (tokens FWD de foco).
 * Es presentacional y controlado: el estado vive en el componente padre.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-9 w-full rounded-lg border border-border/60 bg-surface pl-8 pr-3 text-sm outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      />
    </div>
  )
}
