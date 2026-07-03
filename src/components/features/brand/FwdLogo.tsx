import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface FwdLogoProps {
  className?: string
}

export function FwdLogo({ className }: FwdLogoProps) {
  return (
    <Image
      src="/images/brand/logo.png"
      alt="Marketplace FWD Logo"
      width={100}
      height={100}
      priority
      className={cn('shrink-0 object-contain', className)}
    />
  )
}
