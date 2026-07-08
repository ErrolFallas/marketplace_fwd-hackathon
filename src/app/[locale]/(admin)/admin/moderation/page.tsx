import { getLocale, getTranslations } from 'next-intl/server'
import {
  AlertTriangle,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  Flag,
  LifeBuoy,
} from 'lucide-react'
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
import { StrikeActions } from '@/components/features/admin/StrikeActions'
import { StrikeAuditHistory } from '@/components/features/admin/StrikeAuditHistory'
import { CreateStrikeButton } from '@/components/features/admin/CreateStrikeButton'
import { ModerationReportActions } from '@/components/features/admin/ModerationReportActions'
import { LoadMoreButton } from '@/components/features/admin/LoadMoreButton'
import { getCurrentUser } from '@/lib/auth/dal'
import {
  listUsersWithStrikes,
  listUsers,
  listPostulacionesRevisadasIa,
  type AdminAccountStatus,
  MAX_STRIKES_LIMIT,
} from '@/lib/admin/queries'
import { listarColaReportes } from '@/lib/moderation/report-actions'
import { RevisorOfertasReports } from '@/components/features/admin/RevisorOfertasReports'
import { getSupportTickets } from '@/lib/company/actions'

// ── Risk-level helpers ────────────────────────────────────────────────────────

type RiskLevel = 'salvable' | 'suspendido' | 'expulsion'

function getRiskLevel(strikes: number, estado: AdminAccountStatus): RiskLevel {
  if (estado === 'suspendida_severa') return 'expulsion'
  if (strikes >= MAX_STRIKES_LIMIT || estado === 'suspendida')
    return 'suspendido'
  return 'salvable'
}

const RISK_CONFIG: Record<
  RiskLevel,
  { labelKey: string; icon: React.ElementType; className: string }
> = {
  salvable: {
    labelKey: 'riskSalvable',
    icon: ShieldCheck,
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  suspendido: {
    labelKey: 'riskSuspendido',
    icon: ShieldAlert,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  expulsion: {
    labelKey: 'riskExpulsion',
    icon: ShieldX,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_BADGE_CLASS: Record<AdminAccountStatus, string> = {
  activa: 'bg-accent/10 text-accent border-accent/20',
  pendiente: 'bg-warning/10 text-warning border-warning/20',
  suspendida: 'bg-magenta/10 text-magenta border-magenta/20',
  suspendida_severa: 'bg-destructive/10 text-destructive border-destructive/20',
}

// ─────────────────────────────────────────────────────────────────────────────

interface AdminModerationPageProps {
  searchParams: Promise<{ limit?: string }>
}

export default async function AdminModerationPage({
  searchParams,
}: AdminModerationPageProps) {
  const params = await searchParams
  const rawLimit = Number(params.limit)
  const limit = isNaN(rawLimit) || rawLimit < 7 ? 7 : rawLimit

  const t = await getTranslations('Admin')
  const locale = await getLocale()

  const result = await listUsersWithStrikes(1)
  const allPenalizedUsers = result.ok ? result.data : []
  const users = allPenalizedUsers.slice(0, limit)
  const hasMoreUsers = allPenalizedUsers.length > limit

  const allUsersRes = await listUsers()
  const allUsers = allUsersRes.ok ? allUsersRes.data : []

  const currentUser = await getCurrentUser()
  const currentUserId = currentUser?.id ?? null

  const colaRes = await listarColaReportes()
  const allReportes = colaRes.ok ? colaRes.data : []
  const reportes = allReportes.slice(0, limit)

  const revisorOfertasRes = await listPostulacionesRevisadasIa()
  const revisorOfertas = revisorOfertasRes.ok ? revisorOfertasRes.data : []

  const ticketsRes = await getSupportTickets()
  const allTickets = ticketsRes.ok ? ticketsRes.data : []
  const tickets = allTickets.slice(0, limit)
  const supportFailed = !ticketsRes.ok

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
        title={t('moderationSupportTitle')}
        description={t('moderationSupportDesc')}
        dotColor="text-warning"
        action={
          <CreateStrikeButton users={allUsers} currentUserId={currentUserId} />
        }
      />

      <div className="mt-6 space-y-6">
        <Tabs defaultValue="moderation" className="w-full">
          <div className="flex justify-center md:justify-start w-full">
            <TabsList
              label={t('moderation')}
              className="mb-4 grid grid-cols-2 gap-1 w-full rounded-2xl md:inline-flex md:w-auto md:rounded-full h-auto"
            >
              <TabsTrigger value="moderation">
                {t('usersPenalizedTab')}
                {users.length > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning/20 px-1 text-[9px] font-bold text-warning">
                    {users.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="audit">{t('auditHistoryTab')}</TabsTrigger>
              <TabsTrigger value="reports">
                {t('reportQueueTab')}
                {reportes.length > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive/20 px-1 text-[9px] font-bold text-destructive">
                    {reportes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="revisor-ofertas">
                {t('revisorOfertasTab')}
                {revisorOfertas.length > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent/20 px-1 text-[9px] font-bold text-accent">
                    {revisorOfertas.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="support">
                {t('supportTab')}
                {tickets.length > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[9px] font-bold text-primary">
                    {tickets.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab: Usuarios Penalizados ── */}
          <TabsContent value="moderation" className="space-y-6">
            {users.length === 0 ? (
              <EmptyState
                title={t('noUsersWithStrikes')}
                description={t('noUsersWithStrikesDesc')}
                icon={AlertTriangle}
              />
            ) : (
              <div className="space-y-4">
                {/* Tabla para Desktop (oculta en móvil) */}
                <div className="hidden md:block rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
                  {/* Sub-header */}
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('usersWithActiveStrikesCount', {
                        count: users.length,
                      })}
                    </span>
                    <span className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-accent" />{' '}
                        {t('riskLegendSalvable', {
                          max: MAX_STRIKES_LIMIT - 1,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-warning" />{' '}
                        {t('riskLegendSuspendido', { min: MAX_STRIKES_LIMIT })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-destructive" />{' '}
                        {t('riskExpulsion')}
                      </span>
                    </span>
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
                          {t('colStrikes')}
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
                        const riskLevel = getRiskLevel(
                          user.cantidad_strikes,
                          user.estado_cuenta,
                        )
                        const risk = RISK_CONFIG[riskLevel]
                        const RiskIcon = risk.icon

                        const riskBorderColor =
                          riskLevel === 'expulsion'
                            ? 'bg-destructive'
                            : riskLevel === 'suspendido'
                              ? 'bg-warning'
                              : 'bg-accent'

                        const avatarClass =
                          riskLevel === 'expulsion'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : riskLevel === 'suspendido'
                              ? 'bg-warning/10 text-warning border-warning/20'
                              : 'bg-accent/10 text-accent border-accent/20'

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
                                  className={`w-1 h-8 rounded-full shrink-0 ${riskBorderColor}`}
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
                            <TableCell className="py-3.5">
                              <div className="flex flex-col gap-1.5">
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-warning/10 text-xs font-bold tabular-nums text-warning">
                                  {user.cantidad_strikes}
                                </span>
                                <span
                                  className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${risk.className}`}
                                >
                                  <RiskIcon className="h-3 w-3 shrink-0" />
                                  {t(risk.labelKey)}
                                </span>
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
                              <StrikeActions
                                userId={user.id_usuario}
                                userName={`${user.nombre} ${user.apellido_1}`}
                                cantidadStrikes={user.cantidad_strikes}
                                isSelf={user.id_usuario === currentUserId}
                                isExpelled={
                                  user.estado_cuenta === 'suspendida_severa'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Lista de Tarjetas para Móvil (oculta en desktop) */}
                <div className="block md:hidden space-y-4">
                  <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex flex-col gap-1.5 bg-muted/30 p-3.5 rounded-xl border border-border/50">
                    <span className="font-bold text-foreground">
                      {t('usersWithActiveStrikesCount', {
                        count: users.length,
                      })}
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-accent" />{' '}
                        {t('riskLegendSalvable', {
                          max: MAX_STRIKES_LIMIT - 1,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-warning" />{' '}
                        {t('riskLegendSuspendido', { min: MAX_STRIKES_LIMIT })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-destructive" />{' '}
                        {t('riskExpulsion')}
                      </span>
                    </div>
                  </div>

                  {users.map((user) => {
                    const riskLevel = getRiskLevel(
                      user.cantidad_strikes,
                      user.estado_cuenta,
                    )
                    const risk = RISK_CONFIG[riskLevel]
                    const RiskIcon = risk.icon

                    // Borde izquierdo por nivel de riesgo (paleta FWD)
                    const riskBorderClass =
                      riskLevel === 'expulsion'
                        ? 'border-l-destructive'
                        : riskLevel === 'suspendido'
                          ? 'border-l-warning'
                          : 'border-l-accent'

                    return (
                      <div
                        key={user.id_usuario}
                        className={`rounded-2xl border border-border border-l-4 bg-surface p-5 shadow-sm space-y-3 ${riskBorderClass}`}
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
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                          >
                            {roleLabel(user.nombre_rol)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/60 pt-3 text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground/80 block mb-0.5">
                              {t('colStatus')}
                            </span>
                            {user.is_active ? (
                              <Badge
                                variant="outline"
                                className={`rounded-full border px-2 text-[10px] font-semibold ${STATUS_BADGE_CLASS[user.estado_cuenta]}`}
                              >
                                {statusLabel(user.estado_cuenta)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="rounded-full border border-magenta/20 bg-magenta/10 px-2 text-[10px] font-semibold text-magenta"
                              >
                                {t('accountInactive')}
                              </Badge>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground/80 block mb-0.5">
                              {t('colStrikes')}
                            </span>
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-warning/10 text-xs font-bold tabular-nums text-warning">
                              {user.cantidad_strikes}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/60 pt-2 text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground/80 block mb-0.5">
                              {t('colRiskLevel')}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${risk.className}`}
                            >
                              <RiskIcon className="h-3 w-3 shrink-0" />
                              {t(risk.labelKey)}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground/80 block mb-0.5">
                              {t('colRegistered')}
                            </span>
                            <span className="text-foreground">
                              {new Date(user.fecha_registro).toLocaleDateString(
                                locale,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-border/60 pt-3 flex justify-end">
                          <StrikeActions
                            userId={user.id_usuario}
                            userName={`${user.nombre} ${user.apellido_1}`}
                            cantidadStrikes={user.cantidad_strikes}
                            isSelf={user.id_usuario === currentUserId}
                            isExpelled={
                              user.estado_cuenta === 'suspendida_severa'
                            }
                          />
                        </div>
                      </div>
                    )
                  })}
                  <LoadMoreButton currentLimit={limit} hasMore={hasMoreUsers} />
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Historial de Auditoría ── */}
          <TabsContent value="audit">
            <StrikeAuditHistory />
          </TabsContent>

          {/* ── Tab: Cola de reportes (RF-69) ── */}
          <TabsContent value="reports" className="space-y-6">
            {reportes.length === 0 ? (
              <EmptyState
                title={t('reportQueueEmpty')}
                description={t('reportQueueEmptyDesc')}
                icon={Flag}
              />
            ) : (
              <div className="space-y-4">
                {/* Tabla para Desktop (oculta en móvil) */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <div className="border-b border-border bg-muted/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('reportQueueCount', { count: reportes.length })}
                  </div>
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="font-semibold text-foreground/80 pl-6">
                          {t('reportColReporter')}
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80">
                          {t('reportColTarget')}
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80">
                          {t('reportColDescription')}
                        </TableHead>
                        <TableHead className="pr-6 font-semibold text-foreground/80">
                          {t('colActions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportes.map((reporte) => {
                        const nameForInitials = reporte.reportante_nombre || 'R'
                        const initials = (
                          nameForInitials[0] ?? ''
                        ).toUpperCase()

                        return (
                          <TableRow
                            key={reporte.id_reporte}
                            className="hover:bg-muted/40 transition-colors duration-200 border-b border-border/60"
                          >
                            <TableCell className="py-3.5 pl-6">
                              <div className="flex items-center gap-3">
                                {/* Barra vertical de acento de color */}
                                <div className="w-1 h-8 rounded-full shrink-0 bg-destructive" />

                                {/* Avatar con iniciales */}
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-destructive/10 text-destructive border-destructive/20 text-xs font-bold">
                                  {initials}
                                </div>

                                <div>
                                  <p className="font-semibold text-foreground leading-snug">
                                    {reporte.reportante_nombre}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                                    {new Date(
                                      reporte.reportado_at,
                                    ).toLocaleDateString(locale, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5">
                              <div className="flex flex-col gap-1.5">
                                {reporte.target ? (
                                  <>
                                    <span className="font-semibold text-foreground leading-snug text-sm">
                                      {reporte.target.nombre}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                    >
                                      {t(`targetTipo_${reporte.target.tipo}`)}
                                      {' · '}
                                      {t(`tipoReporte_${reporte.tipo_reporte}`)}
                                    </Badge>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 max-w-[240px]">
                              <p className="text-sm text-foreground/80 line-clamp-2">
                                {reporte.descripcion}
                              </p>
                            </TableCell>
                            <TableCell className="py-3.5 pr-6">
                              <ModerationReportActions
                                reportId={reporte.id_reporte}
                                canStrike={reporte.target?.tipo === 'usuario'}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Lista de Tarjetas para Móvil (oculta en desktop) */}
                <div className="block md:hidden space-y-4">
                  <div className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {t('reportQueueCount', { count: reportes.length })}
                  </div>
                  {reportes.map((reporte) => (
                    <div
                      key={reporte.id_reporte}
                      className="rounded-2xl border border-border border-l-4 border-l-destructive bg-surface p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            {t('reportColReporter')}
                          </span>
                          <h4 className="font-semibold text-foreground text-sm">
                            {reporte.reportante_nombre}
                          </h4>
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        >
                          {t(`tipoReporte_${reporte.tipo_reporte}`)}
                        </Badge>
                      </div>

                      <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground space-y-2">
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('reportColTarget')}
                          </span>
                          {reporte.target ? (
                            <span className="text-foreground">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-primary mr-1">
                                [{t(`targetTipo_${reporte.target.tipo}`)}]
                              </span>
                              {reporte.target.nombre}
                            </span>
                          ) : (
                            '—'
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('reportColDescription')}
                          </span>
                          <p className="text-sm text-foreground prose-body bg-muted/20 p-2.5 rounded-xl border border-border/50">
                            {reporte.descripcion}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('reportColDate')}
                          </span>
                          <span className="text-foreground">
                            {new Date(reporte.reportado_at).toLocaleDateString(
                              locale,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border/60 pt-3 flex justify-end">
                        <ModerationReportActions
                          reportId={reporte.id_reporte}
                          canStrike={reporte.target?.tipo === 'usuario'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Revisor de ofertas (coherencia temática, advisory) ── */}
          <TabsContent value="revisor-ofertas" className="space-y-6">
            <RevisorOfertasReports items={revisorOfertas} />
          </TabsContent>

          {/* ── Tab: Soporte (tickets de contacto) ── */}
          <TabsContent value="support" className="space-y-6">
            {supportFailed ? (
              <EmptyState
                title={t('supportError')}
                description={t('supportErrorDesc')}
                icon={LifeBuoy}
              />
            ) : tickets.length === 0 ? (
              <EmptyState
                title={t('supportEmpty')}
                description={t('supportEmptyDesc')}
                icon={LifeBuoy}
              />
            ) : (
              <div className="space-y-4">
                {/* Tabla para Desktop (oculta en móvil) */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <div className="border-b border-border bg-muted/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('supportCount', { count: tickets.length })}
                  </div>
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="font-semibold text-foreground/80 pl-6">
                          {t('colName')}
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80">
                          {t('supportColCompany')}
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80">
                          {t('supportColMessage')}
                        </TableHead>
                        <TableHead className="font-semibold text-foreground/80 pr-6">
                          {t('supportColDate')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => {
                        const nameForInitials =
                          ticket.userName || ticket.userEmail || 'S'
                        const initials = (
                          nameForInitials[0] ?? ''
                        ).toUpperCase()

                        return (
                          <TableRow
                            key={ticket.id}
                            className="hover:bg-muted/40 transition-colors duration-200 border-b border-border/60"
                          >
                            <TableCell className="py-3.5 pl-6">
                              <div className="flex items-center gap-3">
                                {/* Barra vertical de acento de color */}
                                <div className="w-1 h-8 rounded-full shrink-0 bg-primary" />

                                {/* Avatar con iniciales */}
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                                  {initials}
                                </div>

                                <div>
                                  <p className="font-semibold text-foreground leading-snug">
                                    {ticket.userName || ticket.userEmail}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {ticket.userEmail}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 text-sm font-medium text-foreground/80">
                              {ticket.companyName || t('supportNoCompany')}
                            </TableCell>
                            <TableCell className="py-3.5 max-w-[260px]">
                              <p className="text-sm text-foreground/80 line-clamp-2">
                                {ticket.description}
                              </p>
                            </TableCell>
                            <TableCell className="py-3.5 text-xs text-muted-foreground pr-6">
                              {new Date(ticket.createdAt).toLocaleDateString(
                                locale,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Lista de Tarjetas para Móvil (oculta en desktop) */}
                <div className="block md:hidden space-y-4">
                  <div className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {t('supportCount', { count: tickets.length })}
                  </div>
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-border border-l-4 border-l-primary bg-surface p-5 shadow-sm space-y-3"
                    >
                      <div>
                        <h4 className="font-heading text-base font-bold text-foreground leading-snug">
                          {ticket.userName || ticket.userEmail}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ticket.userEmail}
                        </p>
                      </div>

                      <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground space-y-2">
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('supportColCompany')}
                          </span>
                          <span className="text-foreground">
                            {ticket.companyName || t('supportNoCompany')}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('supportColMessage')}
                          </span>
                          <p className="text-sm text-foreground prose-body bg-muted/20 p-2.5 rounded-xl border border-border/50">
                            {ticket.description}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('supportColDate')}
                          </span>
                          <span className="text-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString(
                              locale,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
