'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { ArrowRight, Database, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { completarOnboarding, signOut } from '@/lib/auth/actions'

type TituloFwd = 'frontend' | 'backend' | 'fullstack' | ''

interface EgresadoConsentScreenProps {
  /** Datos de la cuenta OAuth (Google), pre-rellenados y editables. */
  nombreInicial?: string
  primerApellidoInicial?: string
  segundoApellidoInicial?: string
}

const labelBase = 'text-sm font-bold text-ink'
const inputBase =
  'pl-11 h-12 rounded-xl bg-surface-sunken/50 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all'
const inputPlain =
  'pl-3 h-12 rounded-xl bg-surface-sunken/50 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all'
const selectClass =
  'w-full h-12 rounded-xl border border-border bg-surface-sunken/50 px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] cursor-pointer'

export function EgresadoConsentScreen({
  nombreInicial = '',
  primerApellidoInicial = '',
  segundoApellidoInicial = '',
}: EgresadoConsentScreenProps) {
  const tO = useTranslations('Onboarding')
  const tAuth = useTranslations('Auth')
  const router = useRouter()

  const [nombre, setNombre] = useState(nombreInicial)
  const [primerApellido, setPrimerApellido] = useState(primerApellidoInicial)
  const [segundoApellido, setSegundoApellido] = useState(segundoApellidoInicial)
  const [tituloFwd, setTituloFwd] = useState<TituloFwd>('')
  const [consentFWD, setConsentFWD] = useState(false)
  const [consentTerminos, setConsentTerminos] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (nombre.trim().length < 2 || primerApellido.trim().length < 2) {
      toast.error(tO('nombreRequired'))
      return
    }
    if (tituloFwd === '') {
      toast.error(tO('tituloFwdRequired'))
      return
    }
    if (!consentFWD) {
      toast.error(tO('consentRequired'))
      return
    }
    if (!consentTerminos) {
      toast.error(tO('terminosRequired'))
      return
    }

    setLoading(true)
    const result = await completarOnboarding({
      role: 'egresado',
      tituloFwd,
      nombre: nombre.trim(),
      primerApellido: primerApellido.trim(),
      ...(segundoApellido.trim()
        ? { segundoApellido: segundoApellido.trim() }
        : {}),
      aceptaTerminos: true,
      aceptaCotejo: true,
    })
    setLoading(false)

    if (result.ok) {
      router.push('/pending-approval')
      return
    }
    toast.error(tO('errorGeneric'))
  }

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    router.push('/login')
  }

  return (
    <AuthCard>
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Database className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold font-heading text-ink-strong">
            {tO('egresadoTitle')}
            <span className="text-primary">.</span>
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed prose-body">
            {tO('egresadoMessage')}
          </p>
        </div>

        {/* Datos de la persona (pre-rellenados desde Google, editables) */}
        <div className="space-y-1.5">
          <Label htmlFor="nombre" className={labelBase}>
            {tAuth('nombreLabel')}
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <Input
              id="nombre"
              type="text"
              autoComplete="given-name"
              placeholder={tAuth('nombreLabel')}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="primerApellido" className={labelBase}>
            {tAuth('primerApellidoLabel')}
          </Label>
          <Input
            id="primerApellido"
            type="text"
            autoComplete="family-name"
            placeholder={tAuth('primerApellidoLabel')}
            value={primerApellido}
            onChange={(e) => setPrimerApellido(e.target.value)}
            className={inputPlain}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="segundoApellido" className={labelBase}>
            {tAuth('segundoApellidoLabel')}
            <span className="ml-1 text-ink-subtle font-normal normal-case tracking-normal">
              {tAuth('optionalMark')}
            </span>
          </Label>
          <Input
            id="segundoApellido"
            type="text"
            placeholder={tAuth('segundoApellidoLabel')}
            value={segundoApellido}
            onChange={(e) => setSegundoApellido(e.target.value)}
            className={inputPlain}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tituloFwd" className={labelBase}>
            {tO('labelTituloFwd')}
          </Label>
          <select
            id="tituloFwd"
            value={tituloFwd}
            onChange={(e) => setTituloFwd(e.target.value as TituloFwd)}
            className={selectClass}
          >
            <option value="" disabled>
              {tO('tituloFwdPlaceholder')}
            </option>
            <option value="frontend">{tO('tituloFrontend')}</option>
            <option value="backend">{tO('tituloBackend')}</option>
            <option value="fullstack">{tO('tituloFullstack')}</option>
          </select>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-3">
            <input
              type="checkbox"
              checked={consentFWD}
              onChange={(e) => setConsentFWD(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <span className="text-xs text-muted-foreground">
              {tO('consentLabel')}
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/80 bg-muted/20 p-3">
            <input
              type="checkbox"
              checked={consentTerminos}
              onChange={(e) => setConsentTerminos(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <span className="text-xs text-muted-foreground">
              {tO('terminosLabel')}
            </span>
          </label>
        </div>

        <Button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] cursor-pointer"
        >
          {loading ? tO('loading') : tO('saveProfile')}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </Button>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="w-full text-center text-xs font-semibold text-ink-subtle hover:text-ink transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] disabled:opacity-50"
        >
          {tO('signOut')}
        </button>
      </div>
    </AuthCard>
  )
}
