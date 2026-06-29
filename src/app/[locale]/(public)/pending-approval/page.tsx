import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Clock, LogOut, AlertTriangle } from 'lucide-react'
import { AuthCard } from '@/components/features/auth/AuthCard'
import { ReverificacionEmpresaForm } from '@/components/features/companies/ReverificacionEmpresaForm'
import type { ReverificacionInitialValues } from '@/components/features/companies/ReverificacionEmpresaForm'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { normalizeRole, ROLE_HOME } from '@/lib/auth/roles'
import { signOut } from '@/lib/auth/actions'
import { getCompanyProfileForEdit } from '@/lib/company/actions'
import { getCountryOptions, getSubdivisions } from '@/lib/geo/catalog'

async function handleSignOut() {
  'use server'
  await signOut()
  redirect('/')
}

function LogoutButton({ label }: { label: string }) {
  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 text-xs font-bold text-ink-subtle hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        {label}
      </button>
    </form>
  )
}

export default async function PendingApprovalPage() {
  const t = await getTranslations('Account')
  const tCommon = await getTranslations('Common')
  const locale = await getLocale()

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: roleRaw } = await supabase.rpc('get_my_role')
  const role = normalizeRole(roleRaw as string | null)

  if (!user) {
    redirect('/login')
  }

  if (!role) {
    redirect(`/${locale}/onboarding`)
  }

  // Estado de verificación + motivo (si fue rechazado), por rol.
  let estado: string | null = null
  let motivo: string | null = null
  if (role === 'egresado') {
    const { data } = await supabase
      .from('estudiantes')
      .select('estado_verificacion, motivo_rechazo')
      .eq('id_usuario', user.id)
      .maybeSingle()
    estado = data?.estado_verificacion ?? null
    motivo = data?.motivo_rechazo ?? null
  } else if (role === 'empresario') {
    const { data } = await supabase
      .from('empresarios')
      .select('estado_verificacion, motivo_rechazo')
      .eq('id_usuario', user.id)
      .maybeSingle()
    estado = data?.estado_verificacion ?? null
    motivo = data?.motivo_rechazo ?? null
  }

  // Verificado → al panel. Evita el rebote con el gate (que solo deja entrar a
  // verificados).
  if (estado === 'verificado') {
    redirect(`/${locale}${ROLE_HOME[role]}`)
  }

  const motivoBox = motivo ? (
    <div className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 text-left">
      <p className="text-[10px] font-bold uppercase tracking-widest text-warning">
        {t('rejectedMotivoLabel')}
      </p>
      <p className="mt-1 text-sm text-ink-muted font-medium leading-relaxed prose-body">
        {motivo}
      </p>
    </div>
  ) : null

  // Empresario rechazado → puede actualizar sus datos y reenviar (RF-17).
  if (estado === 'rechazado' && role === 'empresario') {
    const profileRes = await getCompanyProfileForEdit()
    if (profileRes.ok) {
      const p = profileRes.data
      const countries = getCountryOptions(locale).map((country) => ({
        value: country.code,
        label: country.name,
      }))
      const initialRegions = p.country
        ? getSubdivisions(p.country).map((subdivision) => ({
            value: subdivision.code,
            label: subdivision.name,
          }))
        : []
      const initialValues: ReverificacionInitialValues = {
        nombre: p.firstName,
        primer_apellido: p.lastName1,
        segundo_apellido: p.lastName2 ?? '',
        fecha_nacimiento: p.birthDate,
        nombre_empresa: p.name,
        cedula: p.cedula ?? '',
        sitio_web: p.website,
        tipo_empresario:
          p.companyType === 'formal' ? 'empresa_formal' : 'emprendedor',
        pais: p.country,
        ciudad: p.city ?? '',
        alcance_operativo: p.operatingScope ?? '',
        foto_perfil: p.profilePhoto,
      }

      return (
        <AuthCard wide>
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-warning">
                {t('rejectedEyebrow')}
              </p>
              <h1 className="text-2xl font-bold font-heading text-ink-strong">
                {t('rejectedTitle')}
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm text-ink-muted font-medium leading-relaxed prose-body">
                {t('rejectedEmpresarioDesc')}
              </p>
            </div>

            {motivoBox}

            <ReverificacionEmpresaForm
              userId={user.id}
              countries={countries}
              initialRegions={initialRegions}
              initialValues={initialValues}
            />

            <div className="text-center">
              <LogoutButton label={tCommon('logout')} />
            </div>
          </div>
        </AuthCard>
      )
    }
  }

  // Egresado rechazado (típicamente por cotejo) → motivo honesto + contacto, sin
  // reenvío: editar datos no resuelve el cotejo contra la base FWD.
  if (estado === 'rechazado' && role === 'egresado') {
    return (
      <AuthCard>
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="w-14 h-14" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-warning">
              {t('rejectedEyebrow')}
            </p>
            <h1 className="text-2xl font-bold font-heading text-ink-strong">
              {t('rejectedTitle')}
              <span className="text-primary">.</span>
            </h1>
            <p className="text-sm text-ink-muted font-medium leading-relaxed prose-body">
              {t('rejectedEgresadoDesc')}
            </p>
          </div>

          {motivoBox}

          <LogoutButton label={tCommon('logout')} />
        </div>
      </AuthCard>
    )
  }

  // Pendiente (estado por defecto): aún en revisión.
  const roleMsg =
    role === 'empresario' ? t('pendingEmpresarioMsg') : t('pendingEgresadoMsg')

  return (
    <AuthCard>
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-warning/10 text-warning">
            <Clock className="w-14 h-14" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
            {t('pendingEyebrow')}
          </p>
          <h1 className="text-2xl font-bold font-heading text-ink-strong">
            {t('pendingTitle')}
            <span className="text-primary">.</span>
          </h1>
          <p className="text-sm text-ink-muted font-medium leading-relaxed prose-body">
            {roleMsg}
          </p>
          <p className="text-xs text-ink-subtle font-medium prose-body">
            {t('pendingDesc')}
          </p>
        </div>

        <LogoutButton label={tCommon('logout')} />
      </div>
    </AuthCard>
  )
}
