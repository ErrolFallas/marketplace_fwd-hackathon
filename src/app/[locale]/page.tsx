import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { SkipToContent } from '@/components/layout/SkipToContent'
import { Footer } from '@/components/layout/Footer'
import { CheckCircle2, Users, Award, Sparkles } from 'lucide-react'
import { LandingHeroCtas } from '@/components/features/landing/LandingHeroCtas'
import { ButterflyHero } from '@/components/features/landing/ButterflyHero'
import { MandalaBg } from '@/components/features/landing/MandalaBg'
import { getLandingStats } from '@/lib/landing/stats'

export default async function LandingPage() {
  const tLanding = await getTranslations('Landing')
  const stats = await getLandingStats()

  return (
    <div className="flex flex-col min-h-screen">
      <SkipToContent />
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Hero — split bicolor con mariposa central */}
        <section
          className="relative overflow-hidden"
          style={{
            minHeight: '620px',
            display: 'flex',
            alignItems: 'center',
            background:
              'linear-gradient(to right, var(--secondary) 0%, var(--secondary) 50%, var(--primary) 50%, var(--primary) 100%)',
          }}
        >
          {/* Mandala decorativo de fondo */}
          <MandalaBg />

          {/* Línea de brillo en el quiebre central */}
          <div
            className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, color-mix(in oklch, var(--surface) 22%, transparent) 25%, color-mix(in oklch, var(--surface) 28%, transparent) 75%, transparent 100%)',
            }}
          />

          {/* Textura de puntos */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, color-mix(in oklch, var(--surface) 5%, transparent) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Contenido principal */}
          <div className="relative z-10 w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
            {/*
              Grid 4-4-4 sin gap en desktop para que el centro de la mariposa (col 5-8)
              coincida exactamente con el quiebre al 50% del fondo.
            */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
              {/* Texto + CTAs — lado morado */}
              <div className="lg:col-span-4 space-y-6 text-left lg:pr-8">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    background:
                      'color-mix(in oklch, var(--surface) 15%, transparent)',
                    borderColor:
                      'color-mix(in oklch, var(--surface) 30%, transparent)',
                    color: 'var(--surface)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {tLanding('badgeVersion')}
                </div>

                {/* H1 con punto azul firma */}
                <h1
                  className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1] font-heading text-balance"
                  style={{
                    color: 'var(--surface)',
                    textShadow:
                      '0 2px 16px color-mix(in oklch, var(--ink-strong) 40%, transparent)',
                  }}
                >
                  {tLanding('heroTitle')}
                  <span style={{ color: 'var(--accent)' }}>.</span>
                </h1>

                <p
                  className="text-lg leading-relaxed prose-body"
                  style={{
                    color:
                      'color-mix(in oklch, var(--surface) 85%, transparent)',
                  }}
                >
                  {tLanding('heroSubtitle')}
                </p>

                <LandingHeroCtas />
              </div>

              {/* Mariposa — centrada en el quiebre */}
              <div className="lg:col-span-4 flex items-center justify-center mt-8 lg:mt-0">
                <ButterflyHero />
              </div>

              {/* Espacio derecho — lado azul */}
              <div className="hidden lg:block lg:col-span-4" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-secondary text-secondary-foreground py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <p className="text-3xl font-extrabold text-accent font-heading">
                {stats.proyectos}
              </p>
              <p className="text-sm text-secondary-foreground/70 mt-1">
                {tLanding('statsProjectsLabel')}
              </p>
            </div>
            <div className="p-4 border-y md:border-y-0 md:border-x border-secondary-foreground/20">
              <p className="text-3xl font-extrabold text-highlight font-heading">
                {stats.estudiantes}
              </p>
              <p className="text-sm text-secondary-foreground/70 mt-1">
                {tLanding('statsTalentLabel')}
              </p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-extrabold text-magenta font-heading">
                {stats.empresarios}
              </p>
              <p className="text-sm text-secondary-foreground/70 mt-1">
                {tLanding('statsCompaniesLabel')}
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8 bg-card/40 border border-border/80 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-primary" />
              <div className="space-y-2">
                <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight font-heading">
                  {tLanding('egresadoTitle')}
                  <span className="text-primary">.</span>
                </h3>
                <p className="text-muted-foreground text-sm prose-body">
                  {tLanding('egresadoDesc')}
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  tLanding('egresadoBenefit1'),
                  tLanding('egresadoBenefit2'),
                  tLanding('egresadoBenefit3'),
                ].map((benefit, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 bg-card/40 border border-border/80 p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-secondary" />
              <div className="space-y-2">
                <div className="p-3 bg-secondary/10 text-secondary w-fit rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight font-heading">
                  {tLanding('companyTitle')}
                  <span className="text-secondary">.</span>
                </h3>
                <p className="text-muted-foreground text-sm prose-body">
                  {tLanding('companyDesc')}
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  tLanding('companyBenefit1'),
                  tLanding('companyBenefit2'),
                  tLanding('companyBenefit3'),
                ].map((benefit, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
