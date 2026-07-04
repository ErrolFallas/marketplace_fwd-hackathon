import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  FwdParallelogram,
  FwdDotGrid,
} from '@/components/features/brand/BrandPatterns'

interface MensajeriaEmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  texturaClass: string
  textoClass: string
}

/**
 * Estado vacío "wow" (§5.7): único momento brand-expresivo de la mensajería,
 * con geometría FWD tintada al acento del rol sobre fondo claro. El resto de la
 * pantalla se mantiene sobrio (registro Product).
 */
export function MensajeriaEmptyState({
  icon,
  title,
  description,
  texturaClass,
  textoClass,
}: MensajeriaEmptyStateProps) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
      <FwdDotGrid className={cn('absolute inset-0 opacity-40', textoClass)} />
      <FwdParallelogram
        className={cn(
          'absolute -right-16 top-0 h-full w-1/3 opacity-30',
          texturaClass,
        )}
      />
      <FwdParallelogram
        className={cn(
          'absolute -left-16 bottom-0 h-2/3 w-1/4 opacity-20',
          texturaClass,
        )}
      />
      <div className="relative flex max-w-sm flex-col items-center gap-3 text-center">
        <div
          className={cn(
            'flex size-16 items-center justify-center rounded-2xl bg-surface shadow-sm',
            textoClass,
          )}
        >
          {icon}
        </div>
        <p className="font-heading text-xl font-bold text-foreground">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
