'use client'

import React, { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'sonner'
import { Mail, User, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { signUpWithPassword } from '@/lib/auth/actions'
import { tieneAlMenos18, type SignUpInput } from '@/lib/auth/schemas'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { AuthHeader } from '@/components/features/auth/AuthHeader'
import { OAuthButtons } from '@/components/features/auth/OAuthButtons'
import { AuthFooter } from '@/components/features/auth/AuthFooter'
import { PasswordStrengthIndicator } from '@/components/features/auth/PasswordStrengthIndicator'
import { RoleSelector } from '@/components/features/auth/RoleSelector'
import { CountryRegionFields } from '@/components/features/geo/CountryRegionFields'
import type { ComboboxOption } from '@/components/ui/combobox'
import type { UserRole } from '@/types'

interface RegisterWizardProps {
  /** Países resueltos al locale (provistos por el server component). */
  countries: ComboboxOption[]
}

interface RegisterFormValues {
  nombre: string
  primerApellido: string
  segundoApellido?: string
  email: string
  password: string
  confirmPassword: string
  tituloFwd?: 'frontend' | 'backend' | 'fullstack'
  tipoEmpresario?: 'empresa_formal' | 'emprendedor'
  nombreEmpresa?: string
  cedula?: string
  sitioWeb?: string
  fechaNacimiento?: string
  pais?: string
  region?: string
  aceptaTerminos: boolean
  aceptaCotejo?: boolean
}

function createRegisterSchema(
  t: ReturnType<typeof useTranslations<'Validation'>>,
  role: UserRole,
) {
  const base = {
    nombre: zod.string().min(2, { message: t('nameMin') }),
    primerApellido: zod.string().min(2, { message: t('required') }),
    segundoApellido: zod.string().max(80).optional(),
    email: zod.string().email({ message: t('emailInvalid') }),
    password: zod.string().min(8, { message: t('passwordMin') }),
    confirmPassword: zod.string(),
    aceptaTerminos: zod
      .boolean()
      .refine((val) => val === true, { message: t('acceptTermsRequired') }),
  }

  const matchPassword = {
    message: t('passwordMismatch'),
    path: ['confirmPassword'],
  }

  if (role === 'empresario') {
    return zod
      .object({
        ...base,
        tipoEmpresario: zod.enum(['empresa_formal', 'emprendedor'], {
          message: t('required'),
        }),
        nombreEmpresa: zod.string().min(2, { message: t('required') }),
        cedula: zod.string().min(1, { message: t('required') }),
        sitioWeb: zod
          .string()
          .url({ message: t('linkInvalid') })
          .or(zod.literal(''))
          .optional(),
        fechaNacimiento: zod
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, { message: t('required') })
          .refine(tieneAlMenos18, { message: t('mustBe18') }),
        pais: zod.string().min(2, { message: t('required') }),
        region: zod.string().optional(),
      })
      .refine((data) => data.password === data.confirmPassword, matchPassword)
  }

  return zod
    .object({
      ...base,
      tituloFwd: zod.enum(['frontend', 'backend', 'fullstack'], {
        message: t('required'),
      }),
      aceptaCotejo: zod
        .boolean()
        .refine((val) => val === true, { message: t('acceptCotejoRequired') }),
    })
    .refine((data) => data.password === data.confirmPassword, matchPassword)
}

const inputBase =
  'pl-11 h-12 rounded-xl bg-surface-sunken/50 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all'
const inputPlain =
  'pl-3 h-12 rounded-xl bg-surface-sunken/50 border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all'
const selectBase =
  'w-full h-12 rounded-xl border border-border bg-surface-sunken/50 px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] cursor-pointer'
const labelBase = 'text-sm font-bold text-ink'
const errorBase = 'text-xs font-semibold text-destructive mt-1'

const TOTAL_STEPS = 3

export function RegisterWizard({ countries }: RegisterWizardProps) {
  const tAuth = useTranslations('Auth')
  const tLogin = useTranslations('Login')
  const tValidation = useTranslations('Validation')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole>('egresado')

  const registerSchema = useMemo(
    () => createRegisterSchema(tValidation, selectedRole),
    [tValidation, selectedRole],
  )

  const maxBirthDate = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 18)
    return d.toISOString().split('T')[0]
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    // `onChange` mantiene `isValid` reactivo para deshabilitar el botón hasta que
    // todo el formulario del paso 3 esté completo y válido (incluye los
    // consentimientos, que el schema exige).
    mode: 'onChange',
    // El schema cambia por rol (egresado/empresario), así que su tipo inferido
    // es una unión que no calza con RegisterFormValues (campos opcionales). El
    // cast tipado salva esa fricción de RHF+zod; la validación en runtime es la
    // del schema activo, correcta para el rol seleccionado.
    resolver: zodResolver(registerSchema) as Resolver<RegisterFormValues>,
    defaultValues: {
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      fechaNacimiento: '',
      pais: '',
      region: '',
      aceptaTerminos: false,
      aceptaCotejo: false,
    },
  })

  const passwordValue = watch('password')

  const goToProfileStep = async () => {
    const valid = await trigger(['email', 'password', 'confirmPassword'])
    if (valid) setStep(3)
  }

  const onSubmit = async (data: RegisterFormValues) => {
    let payload: SignUpInput
    if (selectedRole === 'empresario') {
      if (
        !data.tipoEmpresario ||
        !data.nombreEmpresa ||
        !data.cedula ||
        !data.fechaNacimiento ||
        !data.pais
      ) {
        return
      }
      payload = {
        role: 'empresario',
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        primerApellido: data.primerApellido,
        ...(data.segundoApellido
          ? { segundoApellido: data.segundoApellido }
          : {}),
        tipoEmpresario: data.tipoEmpresario,
        nombreEmpresa: data.nombreEmpresa,
        cedula: data.cedula,
        fechaNacimiento: data.fechaNacimiento,
        pais: data.pais,
        region: data.region ?? '',
        aceptaTerminos: true,
        ...(data.sitioWeb ? { sitioWeb: data.sitioWeb } : {}),
      }
    } else {
      if (!data.tituloFwd) return
      payload = {
        role: 'egresado',
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        primerApellido: data.primerApellido,
        ...(data.segundoApellido
          ? { segundoApellido: data.segundoApellido }
          : {}),
        tituloFwd: data.tituloFwd,
        aceptaTerminos: true,
        aceptaCotejo: true,
      }
    }

    setLoading(true)
    const result = await signUpWithPassword(payload)
    setLoading(false)

    const verifyPath = `/verify-email?email=${encodeURIComponent(data.email)}`

    if (!result.ok) {
      if (result.error === 'email_exists_active') {
        toast.info(tAuth('emailExistsActive'))
        router.push('/login')
        return
      }
      if (result.error === 'email_exists_pending') {
        toast.info(tAuth('emailExistsPending'))
        router.push(verifyPath)
        return
      }
      if (result.error === 'email_exists_suspended') {
        toast.error(tAuth('emailExistsSuspended'))
        return
      }
      const message =
        result.error === 'password_breached'
          ? tAuth('passwordBreached')
          : result.error === 'pwned_check_failed'
            ? tAuth('pwnedCheckFailed')
            : tAuth('errorUnexpected')
      toast.error(message)
      return
    }

    // Registro creado SIN sesión (RF-02): el usuario confirma su correo desde la
    // pantalla de verificación (enlace o código).
    toast.success(tAuth('registerSuccess'))
    router.push(verifyPath)
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true)
    // Guardamos el rol en una cookie antes del redirect OAuth porque Supabase
    // no garantiza preservar query params personalizados en el redirectTo.
    document.cookie = `pending-oauth-role=${selectedRole}; path=/; max-age=300; SameSite=Lax`
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}`,
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <div className="space-y-5">
        <AuthHeader
          welcomeText={tAuth('welcome')}
          title={tAuth('registerTitle')}
          subtitle={tAuth('stepOf', { current: step, total: TOTAL_STEPS })}
        />

        {/* Indicador de progreso */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                n <= step ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            // El submit real solo ocurre en el paso 3; Enter en pasos previos no
            // debe disparar la validación completa del formulario.
            if (e.key === 'Enter' && step !== TOTAL_STEPS) e.preventDefault()
          }}
          className="space-y-4"
          noValidate
        >
          {/* ── Paso 1: Rol ── */}
          {step === 1 && (
            <div className="space-y-5">
              <RoleSelector
                selected={selectedRole}
                onChange={setSelectedRole}
                label={tAuth('roleTitle')}
              />
              <p className="text-xs text-ink-muted leading-snug">
                {tAuth('roleLockNotice')}
              </p>
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200"
              >
                {tAuth('continue')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── Paso 2: Autenticación (solo credenciales) ── */}
          {step === 2 && (
            <div className="space-y-5">
              <OAuthButtons
                onGoogleClick={() => handleOAuthLogin('google')}
                onGitHubClick={() => handleOAuthLogin('github')}
                disabled={loading}
                googleText={tLogin('google')}
                githubText={tLogin('github')}
              />

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-3 text-ink-subtle font-semibold uppercase tracking-wider text-[10px]">
                    {tAuth('orWithEmail')}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className={labelBase}>
                  {tAuth('emailLabel')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={tAuth('emailPlaceholder')}
                    className={`${inputBase} ${errors.email ? 'border-destructive' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className={errorBase}>{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className={labelBase}>
                  {tAuth('passwordLabel')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={tAuth('passwordPlaceholder')}
                    className={`${inputBase} ${errors.password ? 'border-destructive' : ''}`}
                    {...register('password')}
                  />
                </div>
                <PasswordStrengthIndicator password={passwordValue} />
                {errors.password && (
                  <p className={errorBase}>{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className={labelBase}>
                  {tAuth('confirmPasswordLabel')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={tAuth('confirmPasswordPlaceholder')}
                    className={`${inputBase} ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className={errorBase}>{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tAuth('back')}
                </Button>
                <Button
                  type="button"
                  onClick={goToProfileStep}
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200"
                >
                  {tAuth('continue')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Paso 3: Perfil ── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Datos de persona (ambos roles) */}
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
                    className={`${inputBase} ${errors.nombre ? 'border-destructive' : ''}`}
                    {...register('nombre')}
                  />
                </div>
                {errors.nombre && (
                  <p className={errorBase}>{errors.nombre.message}</p>
                )}
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
                  className={`${inputPlain} ${errors.primerApellido ? 'border-destructive' : ''}`}
                  {...register('primerApellido')}
                />
                {errors.primerApellido && (
                  <p className={errorBase}>{errors.primerApellido.message}</p>
                )}
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
                  className={`${inputPlain} ${errors.segundoApellido ? 'border-destructive' : ''}`}
                  {...register('segundoApellido')}
                />
                {errors.segundoApellido && (
                  <p className={errorBase}>{errors.segundoApellido.message}</p>
                )}
              </div>

              {/* Campos por rol */}
              {selectedRole === 'egresado' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="tituloFwd" className={labelBase}>
                    {tAuth('tituloFwdLabel')}
                  </Label>
                  <select
                    id="tituloFwd"
                    className={`${selectBase} ${errors.tituloFwd ? 'border-destructive' : ''}`}
                    defaultValue=""
                    {...register('tituloFwd')}
                  >
                    <option value="" disabled>
                      {tAuth('tituloFwdPlaceholder')}
                    </option>
                    <option value="frontend">{tAuth('tituloFrontend')}</option>
                    <option value="backend">{tAuth('tituloBackend')}</option>
                    <option value="fullstack">
                      {tAuth('tituloFullstack')}
                    </option>
                  </select>
                  {errors.tituloFwd && (
                    <p className={errorBase}>{errors.tituloFwd.message}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fechaNacimiento" className={labelBase}>
                      {tAuth('fechaNacimientoLabel')}
                    </Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      max={maxBirthDate}
                      className={`${inputPlain} ${errors.fechaNacimiento ? 'border-destructive' : ''}`}
                      {...register('fechaNacimiento')}
                    />
                    {errors.fechaNacimiento && (
                      <p className={errorBase}>
                        {errors.fechaNacimiento.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tipoEmpresario" className={labelBase}>
                      {tAuth('tipoEmpresarioLabel')}
                    </Label>
                    <select
                      id="tipoEmpresario"
                      className={`${selectBase} ${errors.tipoEmpresario ? 'border-destructive' : ''}`}
                      defaultValue=""
                      {...register('tipoEmpresario')}
                    >
                      <option value="" disabled>
                        {tAuth('tipoEmpresarioPlaceholder')}
                      </option>
                      <option value="emprendedor">
                        {tAuth('tipoEmprendedor')}
                      </option>
                      <option value="empresa_formal">
                        {tAuth('tipoEmpresaFormal')}
                      </option>
                    </select>
                    {errors.tipoEmpresario && (
                      <p className={errorBase}>
                        {errors.tipoEmpresario.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nombreEmpresa" className={labelBase}>
                      {tAuth('companyNameLabel')}
                    </Label>
                    <Input
                      id="nombreEmpresa"
                      type="text"
                      placeholder={tAuth('companyNameLabel')}
                      className={`${inputPlain} ${errors.nombreEmpresa ? 'border-destructive' : ''}`}
                      {...register('nombreEmpresa')}
                    />
                    {errors.nombreEmpresa && (
                      <p className={errorBase}>
                        {errors.nombreEmpresa.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cedula" className={labelBase}>
                      {tAuth('cedulaLabel')}
                    </Label>
                    <Input
                      id="cedula"
                      type="text"
                      placeholder={tAuth('cedulaLabel')}
                      className={`${inputPlain} ${errors.cedula ? 'border-destructive' : ''}`}
                      {...register('cedula')}
                    />
                    {errors.cedula && (
                      <p className={errorBase}>{errors.cedula.message}</p>
                    )}
                  </div>

                  <CountryRegionFields
                    countries={countries}
                    initialRegions={[]}
                    countryValue={watch('pais') ?? ''}
                    regionValue={watch('region') ?? ''}
                    onCountryChange={(code) =>
                      setValue('pais', code, { shouldValidate: true })
                    }
                    onRegionChange={(code) =>
                      setValue('region', code, { shouldValidate: true })
                    }
                    countryLabel={tAuth('paisLabel')}
                    countryId="pais"
                    regionId="region"
                    countryInvalid={Boolean(errors.pais)}
                  />
                  {errors.pais && (
                    <p className={errorBase}>{errors.pais.message}</p>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="sitioWeb" className={labelBase}>
                      {tAuth('sitioWebLabel')}
                      <span className="ml-1 text-ink-subtle font-normal normal-case tracking-normal">
                        {tAuth('optionalMark')}
                      </span>
                    </Label>
                    <Input
                      id="sitioWeb"
                      type="url"
                      placeholder="https://"
                      className={`${inputPlain} ${errors.sitioWeb ? 'border-destructive' : ''}`}
                      {...register('sitioWeb')}
                    />
                    {errors.sitioWeb && (
                      <p className={errorBase}>{errors.sitioWeb.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Consentimientos (RNF-36 términos / RNF-38 cotejo egresado) */}
              <div className="space-y-2 pt-1">
                <label className="flex cursor-pointer items-start gap-2 text-xs text-ink-muted leading-snug">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    {...register('aceptaTerminos')}
                  />
                  <span>{tAuth('acceptTerms')}</span>
                </label>
                {errors.aceptaTerminos && (
                  <p className={errorBase}>{errors.aceptaTerminos.message}</p>
                )}

                {selectedRole === 'egresado' && (
                  <>
                    <label className="flex cursor-pointer items-start gap-2 text-xs text-ink-muted leading-snug">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                        {...register('aceptaCotejo')}
                      />
                      <span>{tAuth('acceptCotejo')}</span>
                    </label>
                    {errors.aceptaCotejo && (
                      <p className={errorBase}>{errors.aceptaCotejo.message}</p>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tAuth('back')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !isValid}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200"
                >
                  {loading ? tAuth('registering') : tAuth('createAccount')}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center text-xs font-semibold pt-2 text-primary">
          <Link href="/login" className="hover:underline">
            {tAuth('haveAccount')} {tAuth('signIn')}
          </Link>
        </div>

        <AuthFooter />
      </div>
    </AuthCard>
  )
}
