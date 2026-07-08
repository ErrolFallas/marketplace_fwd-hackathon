import { getLocale, getTranslations } from 'next-intl/server'
import {
  Users,
  UserCheck,
  ShieldCheck,
  Power,
  GraduationCap,
  Building2,
  ShieldAlert,
  Briefcase,
  FolderOpen,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { PageTitle } from '@/components/features/brand/PageTitle'
import {
  DashboardStats,
  type StatItem,
} from '@/components/features/DashboardStats'
import { AdminReportsInterface } from '@/components/features/admin/AdminReportsInterface'
import { EmptyState } from '@/components/features/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { LoadMoreButton } from '@/components/features/admin/LoadMoreButton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getUserStats,
  getProjectStats,
  listUsers,
  listAllProjectsForAdmin,
  listAuditoria,
  type AdminAccountStatus,
  type AdminUserStats,
  type AdminProjectStats,
} from '@/lib/admin/queries'

const EMPTY_USER_STATS: AdminUserStats = {
  total: 0,
  pendientes: 0,
  activas: 0,
  desactivadas: 0,
  egresados: 0,
  empresarios: 0,
  administradores: 0,
}

const EMPTY_PROJECT_STATS: AdminProjectStats = {
  total: 0,
  borrador: 0,
  abierto: 0,
  en_recepcion: 0,
  adjudicado: 0,
  en_desarrollo: 0,
  finalizado: 0,
  cancelado: 0,
}

interface AdminReportsPageProps {
  searchParams: Promise<{ limit?: string }>
}

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const params = await searchParams
  const rawLimit = Number(params.limit)
  const limit = isNaN(rawLimit) || rawLimit < 7 ? 7 : rawLimit

  const t = await getTranslations('Admin')
  const tBoard = await getTranslations('ProjectsBoard')
  const locale = await getLocale()

  const [
    userStatsResult,
    usersResult,
    projectStatsResult,
    projectsResult,
    auditResult,
  ] = await Promise.all([
    getUserStats(),
    listUsers(),
    getProjectStats(),
    listAllProjectsForAdmin(),
    listAuditoria(),
  ])

  const userStats = userStatsResult.ok ? userStatsResult.data : EMPTY_USER_STATS
  const allUsers = usersResult.ok ? usersResult.data : []
  const users = allUsers.slice(0, limit)
  const hasMoreUsers = allUsers.length > limit

  const projectStats = projectStatsResult.ok
    ? projectStatsResult.data
    : EMPTY_PROJECT_STATS
  const allProjects = projectsResult.ok ? projectsResult.data : []
  const projects = allProjects.slice(0, limit)
  const hasMoreProjects = allProjects.length > limit

  const allAuditEvents = auditResult.ok ? auditResult.data : []
  const auditEvents = allAuditEvents.slice(0, limit)
  const hasMoreAudit = allAuditEvents.length > limit

  const userCards: StatItem[] = [
    {
      title: t('statTotalUsers'),
      value: userStats.total,
      icon: Users,
      description: t('statTotalUsersDesc'),
      colorClass: 'text-primary bg-primary/10',
    },
    {
      title: t('statPendingUsers'),
      value: userStats.pendientes,
      icon: UserCheck,
      description: t('statPendingUsersDesc'),
      colorClass: 'text-warning bg-warning/10',
    },
    {
      title: t('statActiveUsers'),
      value: userStats.activas,
      icon: ShieldCheck,
      description: t('statActiveUsersDesc'),
      colorClass: 'text-accent bg-accent/10',
    },
    {
      title: t('statInactiveUsers'),
      value: userStats.desactivadas,
      icon: Power,
      description: t('statInactiveUsersDesc'),
      colorClass: 'text-destructive bg-destructive/10',
    },
    {
      title: t('statGraduates'),
      value: userStats.egresados,
      icon: GraduationCap,
      description: t('statGraduatesDesc'),
      colorClass: 'text-secondary bg-secondary/10',
    },
    {
      title: t('statCompanyUsers'),
      value: userStats.empresarios,
      icon: Building2,
      description: t('statCompanyUsersDesc'),
      colorClass: 'text-magenta bg-magenta/10',
    },
    {
      title: t('statAdmins'),
      value: userStats.administradores,
      icon: ShieldAlert,
      description: t('statAdminsDesc'),
      colorClass: 'text-highlight bg-highlight/10',
    },
  ]

  const projectCards: StatItem[] = [
    {
      title: t('statTotalProjects'),
      value: projectStats.total,
      icon: Briefcase,
      description: t('statTotalProjectsDesc'),
      colorClass: 'text-primary bg-primary/10',
    },
    {
      title: t('statOpenProjects'),
      value: projectStats.abierto,
      icon: FolderOpen,
      description: t('statOpenProjectsDesc'),
      colorClass: 'text-accent bg-accent/10',
    },
    {
      title: t('statActiveProjects'),
      value: projectStats.en_desarrollo,
      icon: PlayCircle,
      description: t('statActiveProjectsDesc'),
      colorClass: 'text-secondary bg-secondary/10',
    },
    {
      title: t('statFinishedProjects'),
      value: projectStats.finalizado,
      icon: CheckCircle2,
      description: t('statFinishedProjectsDesc'),
      colorClass: 'text-highlight bg-highlight/10',
    },
    {
      title: t('statCancelledProjects'),
      value: projectStats.cancelado,
      icon: AlertTriangle,
      description: t('statCancelledProjectsDesc'),
      colorClass: 'text-destructive bg-destructive/10',
    },
  ]

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

  const formatDate = (value: string): string =>
    new Date(value).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const formatAccion = (value: string): string =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <PageTitle
        title={t('reportsTitle')}
        description={t('reportsDesc')}
        dotColor="text-primary"
      />

      {/* ── Usuarios: métricas + tabla en pantalla ── */}
      <section className="space-y-6">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {t('reportUsersTitle')}
        </h2>

        <DashboardStats stats={userCards} className="xl:grid-cols-4" />

        <div className="space-y-4">
          {/* Tabla Desktop (oculta en móvil) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-muted/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('reportUsersTitle')}
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
                    {t('colStatus')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80 pr-6">
                    {t('colRegistered')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
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

                  const roleBadgeClass =
                    user.nombre_rol === 'administrador'
                      ? 'border-magenta/30 bg-magenta/10 text-magenta'
                      : user.nombre_rol === 'empresario'
                        ? 'border-secondary/30 bg-secondary/10 text-secondary'
                        : 'border-primary/30 bg-primary/10 text-primary'

                  const statusBadgeClass =
                    user.estado_cuenta === 'activa' && user.is_active
                      ? 'border-accent/30 bg-accent/10 text-accent'
                      : user.estado_cuenta === 'suspendida' ||
                          user.estado_cuenta === 'suspendida_severa'
                        ? 'border-warning/30 bg-warning/10 text-warning'
                        : !user.is_active
                          ? 'border-magenta/30 bg-magenta/10 text-magenta'
                          : 'border-border bg-muted/30 text-muted-foreground'

                  const initials =
                    `${user.nombre[0] ?? ''}${user.apellido_1[0] ?? ''}`.toUpperCase()

                  return (
                    <TableRow
                      key={user.id_usuario}
                      className="hover:bg-muted/40 transition-colors duration-200 border-b border-border/60"
                    >
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-1 h-8 rounded-full shrink-0 ${roleBorderColor}`}
                          />
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${avatarClass}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground leading-snug">
                              {user.nombre} {user.apellido_1}
                              {user.apellido_2 ? ` ${user.apellido_2}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {user.correo}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadgeClass}`}
                        >
                          {roleLabel(user.nombre_rol)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass}`}
                        >
                          {user.is_active
                            ? statusLabel(user.estado_cuenta)
                            : t('accountInactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 text-xs text-muted-foreground pr-6">
                        {formatDate(user.fecha_registro)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {/* Ver más unido a la tabla desktop */}
            <LoadMoreButton currentLimit={limit} hasMore={hasMoreUsers} />
          </div>

          {/* Lista de Tarjetas para Móvil (oculta en desktop) */}
          <div className="block md:hidden space-y-4">
            {users.map((user) => {
              // Borde izquierdo por rol (paleta FWD)
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
                      <h3 className="font-heading text-sm font-bold text-foreground">
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
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
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
                      <span className="text-foreground">
                        {formatDate(user.fecha_registro)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Ver más en móvil */}
          <div className="block md:hidden mt-2">
            <LoadMoreButton currentLimit={limit} hasMore={hasMoreUsers} />
          </div>
        </div>
      </section>

      {/* ── Proyectos: métricas + tabla en pantalla ── */}
      <section className="space-y-6 border-t border-border/40 pt-8">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {t('reportProjectsTitle')}
        </h2>

        <DashboardStats stats={projectCards} className="xl:grid-cols-5" />

        {projects.length === 0 ? (
          <EmptyState
            title={t('noProjects')}
            description={t('noProjectsDesc')}
            icon={Briefcase}
          />
        ) : (
          <>
            <div className="space-y-4">
              {/* Tabla para Desktop (oculta en móvil) */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-semibold text-foreground/80 pl-6 w-2/3">
                        {t('reportColTitle')}
                      </TableHead>
                      <TableHead className="font-semibold text-foreground/80 pr-6 w-1/3">
                        {t('colStatus')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => {
                      const isCompletedOrActive =
                        project.estado === 'en_recepcion' ||
                        project.estado === 'en_desarrollo' ||
                        project.estado === 'adjudicado'

                      const projectBorderColor = isCompletedOrActive
                        ? 'bg-accent'
                        : project.estado === 'cancelado'
                          ? 'bg-destructive'
                          : 'bg-warning'

                      const avatarClass = isCompletedOrActive
                        ? 'bg-accent/10 text-accent border-accent/20'
                        : project.estado === 'cancelado'
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-warning/10 text-warning border-warning/20'

                      const initials = (project.titulo[0] ?? '').toUpperCase()

                      return (
                        <TableRow
                          key={project.id_proyecto}
                          className="hover:bg-muted/40 transition-colors duration-200 border-b border-border/60"
                        >
                          <TableCell className="py-3.5 pl-6">
                            <div className="flex items-center gap-3">
                              {/* Barra vertical de acento de color */}
                              <div
                                className={`w-1 h-8 rounded-full shrink-0 ${projectBorderColor}`}
                              />

                              {/* Avatar con iniciales */}
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${avatarClass}`}
                              >
                                {initials}
                              </div>

                              <div>
                                <p className="font-semibold text-foreground leading-snug">
                                  {project.titulo}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {project.nombre_empresa ??
                                    t('companyUnknown')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 pr-6">
                            <div className="flex flex-col gap-1.5">
                              <Badge
                                variant="outline"
                                className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  isCompletedOrActive
                                    ? 'border-accent/30 bg-accent/10 text-accent'
                                    : project.estado === 'cancelado'
                                      ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                      : project.estado === 'finalizado'
                                        ? 'border-primary/30 bg-primary/10 text-primary'
                                        : 'border-warning/30 bg-warning/10 text-warning'
                                }`}
                              >
                                {tBoard(`status_${project.estado}`)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {project.fecha_publicacion
                                  ? formatDate(project.fecha_publicacion)
                                  : t('notPublished')}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <LoadMoreButton
                  currentLimit={limit}
                  hasMore={hasMoreProjects}
                />
              </div>

              {/* Lista de Tarjetas para Móvil (oculta en desktop) */}
              <div className="block md:hidden space-y-4">
                {projects.map((project) => {
                  // Borde izquierdo por estado del proyecto (paleta FWD)
                  const projectBorderClass =
                    project.estado === 'en_recepcion' ||
                    project.estado === 'en_desarrollo' ||
                    project.estado === 'adjudicado'
                      ? 'border-l-accent'
                      : project.estado === 'cancelado'
                        ? 'border-l-destructive'
                        : 'border-l-warning'
                  return (
                    <div
                      key={project.id_proyecto}
                      className={`rounded-2xl border border-border border-l-4 bg-surface p-5 shadow-sm space-y-3 ${projectBorderClass}`}
                    >
                      <div>
                        <h3 className="font-heading text-sm font-bold text-foreground">
                          {project.titulo}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {project.nombre_empresa ?? t('companyUnknown')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/60 pt-3 text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('colStatus')}
                          </span>
                          <Badge
                            variant="outline"
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                          >
                            {tBoard(`status_${project.estado}`)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80 block mb-0.5">
                            {t('reportColPublished')}
                          </span>
                          <span className="text-foreground">
                            {project.fecha_publicacion
                              ? formatDate(project.fecha_publicacion)
                              : t('notPublished')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <LoadMoreButton
                  currentLimit={limit}
                  hasMore={hasMoreProjects}
                  className="w-full rounded-2xl border border-border mt-4"
                />
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Actividad: tabla de auditoría reciente ── */}
      <section className="space-y-6 border-t border-border/40 pt-8">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {t('reportActivityTitle')}
        </h2>

        {auditEvents.length === 0 ? (
          <EmptyState
            title={t('reportNoActivity')}
            description={t('reportNoActivityDesc')}
            icon={Activity}
          />
        ) : (
          <>
            <div className="space-y-4">
              {/* Tabla para Desktop (oculta en móvil) */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-semibold text-foreground/80 pl-6">
                        {t('reportColActor')}
                      </TableHead>
                      <TableHead className="font-semibold text-foreground/80">
                        {t('reportColAction')}
                      </TableHead>
                      <TableHead className="font-semibold text-foreground/80 pr-6">
                        {t('reportColEntity')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditEvents.map((event) => {
                      const initials =
                        (event.actor_nombre ? event.actor_nombre[0] : 'S') ??
                        'S'
                      const entityColorClass =
                        event.entidad === 'usuarios'
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : event.entidad === 'proyectos'
                            ? 'border-accent/30 bg-accent/10 text-accent'
                            : event.entidad === 'empresarios'
                              ? 'border-secondary/30 bg-secondary/10 text-secondary'
                              : event.entidad === 'estudiantes'
                                ? 'border-warning/30 bg-warning/10 text-warning'
                                : 'border-border bg-muted/30 text-muted-foreground'
                      return (
                        <TableRow
                          key={event.id_auditoria}
                          className="hover:bg-muted/40 transition-colors duration-200 border-b border-border/60"
                        >
                          <TableCell className="py-3.5 pl-6">
                            <div className="flex items-center gap-3">
                              {/* Barra vertical de acento de color */}
                              <div className="w-1 h-8 rounded-full shrink-0 bg-secondary" />

                              {/* Avatar con iniciales */}
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-secondary/10 text-secondary border-secondary/20 text-xs font-bold">
                                {initials}
                              </div>

                              <div>
                                <p className="font-semibold text-foreground leading-snug">
                                  {event.actor_nombre ?? t('reportAuditSystem')}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                                  {formatDate(event.ocurrida_at)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5">
                            <span className="font-semibold text-foreground/80">
                              {formatAccion(event.accion)}
                            </span>
                          </TableCell>
                          <TableCell className="py-3.5 pr-6">
                            <Badge
                              variant="outline"
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${entityColorClass}`}
                            >
                              {event.entidad}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <LoadMoreButton currentLimit={limit} hasMore={hasMoreAudit} />
              </div>

              {/* Lista de Tarjetas para Móvil (oculta en desktop) */}
              <div className="block md:hidden space-y-4">
                {auditEvents.map((event) => (
                  <div
                    key={event.id_auditoria}
                    className="rounded-2xl border border-border border-l-4 border-l-secondary bg-surface p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                          {t('reportColActor')}
                        </span>
                        <h4 className="font-semibold text-foreground text-sm">
                          {event.actor_nombre ?? t('reportAuditSystem')}
                        </h4>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      >
                        {event.entidad}
                      </Badge>
                    </div>

                    <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground space-y-2">
                      <div>
                        <span className="font-semibold text-foreground/80 block mb-0.5">
                          {t('reportColAction')}
                        </span>
                        <p className="text-sm text-foreground prose-body bg-muted/20 p-2.5 rounded-xl border border-border/50">
                          {formatAccion(event.accion)}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground/80 block mb-0.5">
                          {t('reportColDate')}
                        </span>
                        <span className="text-foreground">
                          {formatDate(event.ocurrida_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="block md:hidden">
                  <LoadMoreButton
                    currentLimit={limit}
                    hasMore={hasMoreAudit}
                    className="w-full rounded-2xl border border-border mt-4"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Exportación CSV (todas las entidades) ── */}
      <section className="space-y-6 border-t border-border/40 pt-8">
        <AdminReportsInterface />
      </section>
    </div>
  )
}
