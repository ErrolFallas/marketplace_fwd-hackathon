import { getLocale, getTranslations } from 'next-intl/server'
import { Users, AlertTriangle } from 'lucide-react'
import { PageTitle } from '@/components/features/brand/PageTitle'
import { EmptyState } from '@/components/features/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminUserFilters } from '@/components/features/admin/AdminUserFilters'
import { AccountStatusActions } from '@/components/features/admin/AccountStatusActions'
import { AdminRatingsPanel } from '@/components/features/admin/AdminRatingsPanel'
import { LoadMoreButton } from '@/components/features/admin/LoadMoreButton'
import { getCurrentUser } from '@/lib/auth/dal'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { canManageAdminInUi } from '@/lib/admin/admin-management'
import { getAllCompanyRatingsForAdmin } from '@/lib/company/ratings'
import { getAllEgresadoRatingsForAdmin } from '@/lib/evaluaciones/actions'
import {
  listUsers,
  ADMIN_USER_ROLES,
  ADMIN_ACCOUNT_STATUSES,
  type AdminAccountStatus,
  type ListUsersFilters,
} from '@/lib/admin/queries'

const STATUS_BADGE_CLASS: Record<AdminAccountStatus, string> = {
  activa: 'bg-accent/10 text-accent border-accent/20',
  pendiente: 'bg-warning/10 text-warning border-warning/20',
  suspendida: 'bg-magenta/10 text-magenta border-magenta/20',
  suspendida_severa: 'bg-destructive/10 text-destructive border-destructive/20',
}

interface AdminUsersPageProps {
  searchParams: Promise<{
    q?: string
    role?: string
    status?: string
    limit?: string
  }>
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const t = await getTranslations('Admin')
  const locale = await getLocale()
  const params = await searchParams

  const search = params.q?.trim() || undefined
  const role = ADMIN_USER_ROLES.find((value) => value === params.role)
  const status = ADMIN_ACCOUNT_STATUSES.find((value) => value === params.status)

  const filters: ListUsersFilters = {}
  if (search) filters.search = search
  if (role) filters.role = role
  if (status) filters.status = status

  const result = await listUsers(filters)
  const allUsers = result.ok ? result.data : []

  const rawLimit = Number(params.limit)
  const limit = isNaN(rawLimit) || rawLimit < 7 ? 7 : rawLimit
  const users = allUsers.slice(0, limit)
  const hasMore = allUsers.length > limit

  const currentUser = await getCurrentUser()
  const currentUserId = currentUser?.id ?? null

  // Nivel y antigüedad del caller para decidir, por fila de admin, si puede
  // gestionarla (el backend igual valida; esto solo oculta acciones inválidas).
  let callerNivel: 'superadmin' | 'admin' | 'moderador' | null = null
  let callerFechaRegistro = ''
  if (currentUserId) {
    const adminClient = createSupabaseAdminClient()
    const { data: callerRow } = await adminClient
      .from('usuarios')
      .select('nivel_admin, fecha_registro')
      .eq('id_usuario', currentUserId)
      .maybeSingle()
    callerNivel = callerRow?.nivel_admin ?? null
    callerFechaRegistro = callerRow?.fecha_registro ?? ''
  }

  const [companyRatingsRes, egresadoRatingsRes] = await Promise.all([
    getAllCompanyRatingsForAdmin(),
    getAllEgresadoRatingsForAdmin(),
  ])
  const companyRatings = companyRatingsRes.ok ? companyRatingsRes.data : []
  const egresadoRatings = egresadoRatingsRes.ok ? egresadoRatingsRes.data : []

  const statusLabel = (value: AdminAccountStatus): string => {
    switch (value) {
      case 'pendiente':
        return t('accountStatusPendiente')
      case 'activa':
        return t('accountStatusActiva')
      case 'suspendida':
        return t('accountStatusSuspendida')
      case 'suspendida_severa':
        return t('accountStatusSuspendidaSevera')
    }
  }

  const roleLabel = (nombreRol: string | null): string => {
    switch (nombreRol) {
      case 'administrador':
        return t('roleAdministrador')
      case 'egresado':
        return t('roleEgresado')
      case 'empresario':
        return t('roleEmpresario')
      default:
        return t('roleNone')
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageTitle
        title={t('usersManagement')}
        description={t('usersManagementDesc')}
        dotColor="text-magenta"
      />

      <Tabs defaultValue="users" className="mt-8">
        <div className="flex justify-center md:justify-start w-full">
          <TabsList
            label={t('usersManagement')}
            className="mb-4 grid grid-cols-2 gap-1 w-full rounded-2xl md:inline-flex md:w-auto md:rounded-full h-auto"
          >
            <TabsTrigger value="users">{t('usersTab')}</TabsTrigger>
            <TabsTrigger value="ratings">{t('ratingsTab')}</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab: Usuarios ── */}
        <TabsContent value="users" className="space-y-6">
          <AdminUserFilters
            initialSearch={search ?? ''}
            initialRole={role ?? ''}
            initialStatus={status ?? ''}
          />

          {users.length === 0 ? (
            <EmptyState
              title={t('noUsersFound')}
              description={t('noUsersFoundDesc')}
              icon={Users}
            />
          ) : (
            <div className="space-y-4">
              {users.length >= 100 && (
                <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning-foreground">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <p className="font-semibold">{t('usersLimitWarning')}</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {/* Tabla Desktop (oculta en móvil) */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <div className="border-b border-border bg-muted/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('usersCount', { count: users.length })}
                  </div>
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="font-semibold text-foreground/80 pl-6">
                          {t('colName')}
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80">
                          {t('colRole')}
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80">
                          {t('colRegistered')}
                        </TableHead>
                        <TableHead className="pr-6 font-semibold text-foreground/80">
                          {t('colActions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const isAdminRow = user.nombre_rol === 'administrador'
                        const canManage =
                          !isAdminRow ||
                          canManageAdminInUi({
                            actorNivel: callerNivel,
                            actorFechaRegistro: callerFechaRegistro,
                            targetNivel: user.nivel_admin,
                            targetFechaRegistro: user.fecha_registro,
                          })
                        const canResend =
                          isAdminRow &&
                          user.estado_cuenta === 'pendiente' &&
                          callerNivel === 'superadmin'

                        const roleBorderColor =
                          user.nombre_rol === 'administrador'
                            ? 'bg-magenta'
                            : user.nombre_rol === 'empresario'
                              ? 'bg-secondary'
                              : 'bg-primary'

                        const avatarClass =
                          user.nombre_rol === 'administrador'
                            ? 'bg-magenta/10 text-magenta border-magenta/20'
                            : user.nombre_rol === 'empresario'
                              ? 'bg-secondary/10 text-secondary border-secondary/20'
                              : 'bg-primary/10 text-primary border-primary/20'

                        const initials =
                          `${user.nombre[0] ?? ''}${user.apellido_1[0] ?? ''}`.toUpperCase()

                        return (
                          <TableRow
                            key={user.id_usuario}
                            className="hover:bg-muted/40 transition-colors duration-200 border-b border-border/60"
                          >
                            <TableCell className="py-3.5 pl-6">
                              <div className="flex items-center gap-3">
                                {/* Barra vertical de acento de color */}
                                <div
                                  className={`w-1 h-8 rounded-full shrink-0 ${roleBorderColor}`}
                                />

                                {/* Avatar con iniciales */}
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${avatarClass}`}
                                >
                                  {initials}
                                </div>

                                <div>
                                  <p className="font-semibold text-foreground leading-snug">
                                    {user.nombre} {user.apellido_1}
                                    {user.apellido_2
                                      ? ` ${user.apellido_2}`
                                      : ''}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {user.correo}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-foreground/80">
                                  {roleLabel(user.nombre_rol)}
                                </span>
                                {user.is_active ? (
                                  <Badge
                                    variant="outline"
                                    className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_CLASS[user.estado_cuenta]}`}
                                  >
                                    {statusLabel(user.estado_cuenta)}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="w-fit rounded-full border border-magenta/20 bg-magenta/10 px-2 py-0.5 text-[10px] font-semibold text-magenta"
                                  >
                                    {t('accountInactive')}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 text-xs text-muted-foreground">
                              {new Date(user.fecha_registro).toLocaleDateString(
                                locale,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </TableCell>
                            <TableCell className="py-3.5 pr-6">
                              <AccountStatusActions
                                userId={user.id_usuario}
                                estadoCuenta={user.estado_cuenta}
                                isActive={user.is_active}
                                isSelf={user.id_usuario === currentUserId}
                                userName={`${user.nombre} ${user.apellido_1}`}
                                canManage={canManage}
                                canResend={canResend}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  <LoadMoreButton currentLimit={limit} hasMore={hasMore} />
                </div>

                {/* Lista de Tarjetas para Móvil (oculta en desktop) */}
                <div className="block md:hidden space-y-4">
                  <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('usersCount', { count: users.length })}
                  </div>
                  {users.map((user) => {
                    const isAdminRow = user.nombre_rol === 'administrador'
                    const canManage =
                      !isAdminRow ||
                      canManageAdminInUi({
                        actorNivel: callerNivel,
                        actorFechaRegistro: callerFechaRegistro,
                        targetNivel: user.nivel_admin,
                        targetFechaRegistro: user.fecha_registro,
                      })
                    const canResend =
                      isAdminRow &&
                      user.estado_cuenta === 'pendiente' &&
                      callerNivel === 'superadmin'

                    // Mapeo de colores FWD a bordes izquierdos
                    const roleBorderClass =
                      user.nombre_rol === 'administrador'
                        ? 'border-l-magenta'
                        : user.nombre_rol === 'empresario'
                          ? 'border-l-secondary'
                          : 'border-l-primary'

                    return (
                      <div
                        key={user.id_usuario}
                        className={`rounded-2xl border border-border border-l-4 bg-surface p-5 shadow-sm space-y-3 ${roleBorderClass}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-heading text-base font-bold text-foreground">
                              {user.nombre} {user.apellido_1}
                              {user.apellido_2 ? ` ${user.apellido_2}` : ''}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {user.correo}
                            </p>
                          </div>
                          <div>
                            {user.is_active ? (
                              <Badge
                                variant="outline"
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_CLASS[user.estado_cuenta]}`}
                              >
                                {statusLabel(user.estado_cuenta)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="rounded-full border border-magenta/20 bg-magenta/10 px-2.5 py-0.5 text-[10px] font-semibold text-magenta"
                              >
                                {t('accountInactive')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/60 pt-3 text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground/80 block mb-0.5">
                              {t('colRole')}
                            </span>
                            {roleLabel(user.nombre_rol)}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground/80 block mb-0.5">
                              {t('colRegistered')}
                            </span>
                            {new Date(user.fecha_registro).toLocaleDateString(
                              locale,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                          </div>
                        </div>

                        <div className="border-t border-border/60 pt-3 flex justify-end">
                          <AccountStatusActions
                            userId={user.id_usuario}
                            estadoCuenta={user.estado_cuenta}
                            isActive={user.is_active}
                            isSelf={user.id_usuario === currentUserId}
                            userName={`${user.nombre} ${user.apellido_1}`}
                            canManage={canManage}
                            canResend={canResend}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <LoadMoreButton currentLimit={limit} hasMore={hasMore} />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Tab: Calificaciones (filtro por dirección) ── */}
        <TabsContent value="ratings">
          <AdminRatingsPanel
            egresadoRatings={egresadoRatings}
            companyRatings={companyRatings}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
