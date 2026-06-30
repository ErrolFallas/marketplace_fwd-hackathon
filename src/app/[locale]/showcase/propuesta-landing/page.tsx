import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { HeroSplitDual } from '@/components/features/brand/HeroSplitDual'

interface PropuestaLandingPageProps {
  params: Promise<{ locale: string }>
}

// Demo de diseño del hero split dual (dev-only). Igual que el showcase: fuera de
// desarrollo `notFound()` la prerenderiza como 404 y no llega a producción.
export default async function PropuestaLandingPage({
  params,
}: PropuestaLandingPageProps) {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  const { locale } = await params
  const t = await getTranslations('LandingHero')
  const registerHref = `/${locale}/register`

  return (
    <main className="min-h-screen bg-canvas">
      <HeroSplitDual
        brandName={t('brandName')}
        candidate={{
          eyebrow: t('candidateEyebrow'),
          title: t('candidateTitle'),
          subtitle: t('candidateSubtitle'),
          cta: t('candidateCta'),
          ctaHref: registerHref,
        }}
        company={{
          eyebrow: t('companyEyebrow'),
          title: t('companyTitle'),
          subtitle: t('companySubtitle'),
          cta: t('companyCta'),
          ctaHref: registerHref,
        }}
      />
    </main>
  )
}
