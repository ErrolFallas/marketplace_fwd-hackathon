import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FwdLogo } from '@/components/features/brand/FwdLogo'
import { FwdParallelogram } from '@/components/features/brand/BrandPatterns'
import { cn } from '@/lib/utils/cn'

// Mariposa FWD: PNG con el fondo blanco keyado a transparente desde el asset
// original. Para probar la variante minimalista, cambiar a 'butterfly-2.png'.
const BUTTERFLY_SRC = '/images/brand/butterfly-1.png'
const BUTTERFLY_WIDTH = 965
const BUTTERFLY_HEIGHT = 887

interface HeroPanelContent {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  ctaHref: string
}

interface HeroSplitDualProps {
  brandName: string
  candidate: HeroPanelContent
  company: HeroPanelContent
  className?: string | undefined
}

/**
 * Hero split dual de la landing FWD: lado candidatos (azul, `bg-primary`)
 * y lado empresas (morado, `bg-secondary`), con una "costura" de paralelogramos
 * fast-forward (§5.6) irradiando desde la frontera — el punto de encuentro de
 * ambos públicos. Geometría canónica FWD, no mariposa. Presentacional: recibe
 * todo el copy ya traducido para poder reusarse en la landing real.
 */
export function HeroSplitDual({
  brandName,
  candidate,
  company,
  className,
}: HeroSplitDualProps) {
  return (
    <section
      className={cn(
        'relative isolate grid min-h-[640px] grid-rows-2 overflow-hidden lg:min-h-[600px] lg:grid-cols-2 lg:grid-rows-1',
        className,
      )}
    >
      <h1 className="sr-only">{brandName}</h1>

      {/* ── Lado candidatos (azul) ── */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-primary px-6 py-16 text-primary-foreground sm:px-10 lg:items-start lg:pr-28 lg:pl-16">
        <FwdParallelogram
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 top-0 h-full w-1/3 bg-primary-foreground/5"
        />
        <div className="relative z-20 max-w-sm space-y-4 text-center motion-safe:animate-fade-in lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight">
            {candidate.eyebrow}
          </p>
          <h2 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            {candidate.title}
            <span className="text-highlight">.</span>
          </h2>
          <p className="font-body text-base text-primary-foreground/80">
            {candidate.subtitle}
          </p>
          <Button
            asChild
            variant="highlight"
            className="h-11 rounded-full px-6 text-sm font-semibold shadow-[var(--shadow-elevated)]"
          >
            <Link href={candidate.ctaHref}>
              {candidate.cta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Lado empresas (morado) ── */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-secondary px-6 py-16 text-secondary-foreground sm:px-10 lg:items-end lg:pr-16 lg:pl-28">
        <FwdParallelogram
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-0 h-full w-1/3 bg-secondary-foreground/5"
        />
        <div className="relative z-20 max-w-sm space-y-4 text-center motion-safe:animate-fade-in lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight">
            {company.eyebrow}
          </p>
          <h2 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            {company.title}
            <span className="text-highlight">.</span>
          </h2>
          <p className="font-body text-base text-secondary-foreground/80">
            {company.subtitle}
          </p>
          <Button
            asChild
            variant="highlight"
            className="h-11 rounded-full px-6 text-sm font-semibold shadow-[var(--shadow-elevated)]"
          >
            <Link href={company.ctaHref}>
              {company.cta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Signature: mariposa FWD ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center motion-safe:animate-fade-in"
      >
        {/* halo: glow que sigue la silueta de la mariposa (drop-shadow sobre el
            PNG), la despega de ambos fondos — incluido el ala morada sobre el
            lado morado, donde un disco circular no llegaba */}
        <Image
          src={BUTTERFLY_SRC}
          alt=""
          width={BUTTERFLY_WIDTH}
          height={BUTTERFLY_HEIGHT}
          priority
          className="relative h-auto w-52 drop-shadow-[0_0_22px_oklch(0.99_0.004_245_/_0.5)] sm:w-64 lg:w-72"
        />
      </div>

      {/* ── Pill de marca ── */}
      <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-[var(--shadow-elevated)]">
          <FwdLogo className="size-10" />
          <span className="font-heading text-sm font-bold tracking-tight text-ink-strong">
            {brandName}
            <span className="text-primary">.</span>
          </span>
        </div>
      </div>
    </section>
  )
}
