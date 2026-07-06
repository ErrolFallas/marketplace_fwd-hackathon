import type { ReactNode } from 'react'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Archivo_Narrow, Figtree, JetBrains_Mono } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { getCurrentUser } from '@/lib/auth/dal'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/auth/roles'
import type { UserRole } from '@/types'
import { Toaster } from '@/components/ui/sonner'
import '../globals.css'

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo-narrow',
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  // Rol autoritativo desde el servidor: el cliente ya no depende solo de
  // localStorage para conocer el rol, evitando que un empresario vea la vista
  // de egresado por un valor rancio. Solo se consulta si hay sesion.
  const user = await getCurrentUser()
  let initialRole: UserRole | null = null
  let initialVerified = false
  let initialDisplayName: string | null = null
  let initialAvatarUrl: string | null = null
  if (user) {
    const supabase = await createSupabaseServerClient()
    const { data: roleRaw } = await supabase.rpc('get_my_role')
    initialRole = normalizeRole(roleRaw as string | null)

    // Nombre y avatar de perfil resueltos en el servidor (RLS permite leer la
    // fila propia). Se inyectan al AuthProvider igual que el rol y la
    // verificacion, para que el sidebar muestre el nombre de `usuarios` desde el
    // primer render y no dependa de la query dentro de onAuthStateChange
    // (riesgo de deadlock), que solo queda como refuerzo.
    const { data: profile } = await supabase
      .from('usuarios')
      .select('nombre, apellido_1, foto_perfil')
      .eq('id_usuario', user.id)
      .maybeSingle()
    if (profile) {
      initialDisplayName =
        `${profile.nombre} ${profile.apellido_1}`.trim() || null
      initialAvatarUrl = profile.foto_perfil ?? null
    }

    // Verificación autoritativa desde el servidor (RLS permite leer la fila
    // propia). Se consulta acá y no en el cliente para no hacer queries dentro
    // del callback onAuthStateChange (riesgo de deadlock).
    if (initialRole === 'egresado') {
      const { data: estudiante } = await supabase
        .from('estudiantes')
        .select('estado_verificacion')
        .eq('id_usuario', user.id)
        .maybeSingle()
      initialVerified = estudiante?.estado_verificacion === 'verificado'
    } else if (initialRole === 'empresario') {
      const { data: empresario } = await supabase
        .from('empresarios')
        .select('estado_verificacion')
        .eq('id_usuario', user.id)
        .maybeSingle()
      initialVerified = empresario?.estado_verificacion === 'verificado'
    }
  }

  return (
    <html
      lang={locale}
      className={`${archivoNarrow.variable} ${figtree.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider
            initialRole={initialRole}
            initialVerified={initialVerified}
            initialDisplayName={initialDisplayName}
            initialAvatarUrl={initialAvatarUrl}
          >
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
