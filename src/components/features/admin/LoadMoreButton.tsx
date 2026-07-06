'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface LoadMoreButtonProps {
  currentLimit: number
  hasMore: boolean
  step?: number
  labelMore?: string
  labelLess?: string
  className?: string
}

export function LoadMoreButton({
  currentLimit,
  hasMore,
  step = 7,
  labelMore = 'Ver más',
  labelLess = 'Ver menos',
  className,
}: LoadMoreButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('limit', (currentLimit + step).toString())
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleLoadLess = () => {
    const params = new URLSearchParams(searchParams.toString())
    const newLimit = Math.max(step, currentLimit - step)
    if (newLimit <= step) {
      params.delete('limit')
    } else {
      params.set('limit', newLimit.toString())
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const showLess = currentLimit > step

  if (!hasMore && !showLess) return null

  return (
    <div
      className={`py-5 flex justify-center gap-3 bg-surface border-t border-border/40 w-full rounded-b-2xl ${className ?? ''}`}
    >
      {showLess && (
        <Button
          variant="outline"
          className="rounded-full font-semibold border-border text-muted-foreground hover:bg-muted/50"
          onClick={handleLoadLess}
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          {labelLess}
        </Button>
      )}
      {hasMore && (
        <Button
          variant="outline"
          className="rounded-full font-semibold border-primary/20 text-primary hover:bg-primary/5"
          onClick={handleLoadMore}
        >
          {labelMore}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
