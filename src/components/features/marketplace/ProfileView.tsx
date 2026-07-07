'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Star,
  Globe,
  Lock,
  MapPin,
  ExternalLink,
  GitBranch,
  Pencil,
  BadgeCheck,
  Target,
  FileText,
  Layers,
  FolderGit2,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import {
  saveStudentProfile,
  type StudentProfileView,
  type ProyectoCompletado,
} from '@/lib/portfolio/actions'
import type { CalificacionRecibida } from '@/lib/evaluaciones/actions'
import type { MatchDetail, MatchBreakdown } from '@/lib/projects/match-logic'
import { ReportButton } from '@/components/features/moderation/ReportButton'
import { SectionLabel } from '@/components/features/shared/SectionLabel'
import { ReviewCard, ReviewReply } from '@/components/features/shared'

/** Marcador visual liviano para una sub-sección vacía dentro de la credencial. */
function EmptySectionHint({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/70 bg-canvas/50 px-4 py-3.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground/60" />
      <p className="text-sm italic text-muted-foreground">{label}</p>
    </div>
  )
}

interface ProfileViewProps {
  profile: StudentProfileView
  proyectosCompletados: ProyectoCompletado[]
  calificaciones: CalificacionRecibida[]
  /** True cuando el egresado mira su propio perfil (muestra editar + visibilidad). */
  isOwner?: boolean
  /** Puntaje de match (modo empresa revisando a un candidato). */
  matchScore?: number
  /** Tecnologías en común que sustentan el match. */
  matchDetalles?: MatchDetail[]
  /** Desglose por factor (ubicación e historial) del match. */
  matchDesglose?: MatchBreakdown
  /** Muestra los botones de reporte (un visitante que no es el dueño). */
  reportable?: boolean
  /**
   * Cuando true, elimina el borde, sombra y bordes redondeados del contenedor
   * para integrarse directamente con el fondo de la página (vista de dueño a pantalla completa).
   */
  flat?: boolean
}

export function ProfileView({
  profile,
  proyectosCompletados,
  calificaciones,
  isOwner = false,
  matchScore,
  matchDetalles,
  matchDesglose,
  reportable = false,
  flat = false,
}: ProfileViewProps) {
  const t = useTranslations('Portfolio')
  const tEgresado = useTranslations('Egresado')
  const locale = useLocale()

  const [visibility, setVisibility] = useState<'publico' | 'empresas'>(
    profile.portafolio_visible_publicamente === false ? 'empresas' : 'publico',
  )
  const [isSavingVis, setIsSavingVis] = useState(false)

  const handleVisibilityChange = async (newVis: 'publico' | 'empresas') => {
    if (newVis === visibility) return
    setIsSavingVis(true)
    const res = await saveStudentProfile({
      portafolio_visible_publicamente: newVis === 'publico',
    })
    setIsSavingVis(false)

    if (res.ok) {
      setVisibility(newVis)
      toast.success(t('toastVisibilityUpdated'))
    } else {
      toast.error(t('toastVisibilityError'))
    }
  }

  const fullName = [profile.firstName, profile.lastName1, profile.lastName2]
    .filter(Boolean)
    .join(' ')
  const location = [profile.regionNombre, profile.paisNombre]
    .filter(Boolean)
    .join(', ')
  const hasReputation =
    profile.reputacion !== null &&
    profile.reputacion !== undefined &&
    profile.reputacion > 0

  return (
    <div
      className={`overflow-hidden ${
        flat
          ? 'bg-transparent'
          : 'rounded-3xl border border-primary/20 bg-surface shadow-[var(--shadow-elevated)]'
      }`}
    >
      {/* ── Banda arcoíris top ── */}
      <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

      {/* ══ CABECERA ══ */}
      <div
        className="relative px-6 pb-0 pt-7"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklch, var(--primary) 22%, transparent) 0%, color-mix(in oklch, var(--secondary) 16%, transparent) 60%, color-mix(in oklch, var(--accent) 10%, transparent) 100%)',
        }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Avatar + Nombre */}
          <div className="flex items-center gap-5">
            {/* Avatar con anillo FWD */}
            <div
              className="relative shrink-0 p-0.5 rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--secondary), var(--accent))',
              }}
            >
              <div className="rounded-[14px] overflow-hidden h-24 w-24 ring-2 ring-surface ring-offset-0">
                {profile.profilePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profilePhoto}
                    alt={t('photoAlt')}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center text-3xl font-bold font-heading text-primary-foreground select-none"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 60%, var(--accent) 100%)',
                    }}
                  >
                    {profile.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* Info textual */}
            <div className="space-y-1.5 min-w-0">
              <h2 className="text-2xl font-bold font-heading leading-tight tracking-tight text-foreground">
                {fullName || t('studentFwdFallback')}
              </h2>
              <p className="text-sm font-semibold text-primary capitalize">
                {profile.tituloFwd || t('defaultRole')}
              </p>

              {/* Reputación */}
              {hasReputation && (
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= Math.round(profile.reputacion!)
                          ? 'fill-highlight text-highlight'
                          : 'fill-border text-border'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground tabular-nums ml-0.5">
                    {Number(profile.reputacion).toFixed(1)}
                  </span>
                </div>
              )}

              {/* Ubicación y GitHub */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </span>
                )}
                {profile.urlPortafolio && (
                  <a
                    href={profile.urlPortafolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary font-medium hover:underline"
                  >
                    <GitBranch className="h-3.5 w-3.5" /> {t('githubProfile')}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Badge visibilidad + Editar */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2.5">
            <Badge
              variant={visibility === 'publico' ? 'default' : 'secondary'}
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
            >
              {visibility === 'publico' ? (
                <Globe className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
              {visibility === 'publico'
                ? t('visibilityPublic')
                : t('visibilityCompanies')}
            </Badge>
            {isOwner && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-full border-primary/40 text-primary hover:bg-primary/10"
              >
                <Link href={`/${locale}/egresado/portfolio`}>
                  <Pencil className="h-3.5 w-3.5" />
                  {t('editPortfolio')}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Control de visibilidad (solo dueño) */}
        {isOwner && (
          <div className="mt-5 mb-0 rounded-xl border border-primary/15 bg-surface px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t('visibilityDesc')}
              </p>
              <div
                className="flex w-full gap-0 rounded-full border border-border p-0.5 sm:w-auto"
                style={{ background: 'var(--canvas)' }}
              >
                <button
                  type="button"
                  onClick={() => handleVisibilityChange('publico')}
                  disabled={isSavingVis}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                    visibility === 'publico'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {t('visibilityPublic')}
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange('empresas')}
                  disabled={isSavingVis}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] ${
                    visibility === 'empresas'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  {t('visibilityCompanies')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Separador con degradado */}
        <div
          className="mt-5 h-px w-full"
          style={{
            background:
              'linear-gradient(to right, transparent, color-mix(in oklch, var(--primary) 30%, transparent), color-mix(in oklch, var(--secondary) 20%, transparent), transparent)',
          }}
        />
      </div>

      {/* ══ CONTENIDO ══ */}
      <div className="space-y-7 px-6 py-6 font-sans bg-canvas/40">
        {/* Match score (empresa revisando a un candidato) */}
        {matchScore !== undefined && matchDetalles !== undefined && (
          <div
            className="space-y-3 rounded-xl border border-primary/30 p-4 shadow-sm"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in oklch, var(--primary) 10%, transparent), color-mix(in oklch, var(--accent) 5%, transparent))',
            }}
          >
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-primary font-heading">
                {tEgresado('matchWithStudent', {
                  firstName: profile.firstName,
                  lastName: profile.lastName1,
                  score: matchScore,
                })}
              </h3>
            </div>
            {matchDetalles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('commonTechnologies')}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchDetalles.map((det) => (
                    <Badge
                      key={det.id_tecnologia}
                      variant="outline"
                      className="flex items-center gap-2 border-border bg-surface px-3 py-1 shadow-sm"
                    >
                      <span className="font-semibold text-highlight">
                        {det.nombre_tecnologia || det.id_tecnologia}
                      </span>
                      <span className="text-[10px] uppercase text-primary">
                        ({det.nivel})
                      </span>
                      <span className="font-bold text-primary">
                        +{det.puntos}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('noCommonTech')}
              </p>
            )}

            {matchDesglose && (
              <div className="space-y-1.5 pt-1">
                {matchDesglose.ubicacion.estado !== 'no_aplica' &&
                  matchDesglose.ubicacion.estado !== 'sin_dato' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          matchDesglose.ubicacion.estado === 'distinto'
                            ? 'bg-magenta'
                            : 'bg-accent'
                        }`}
                      />
                      <span>
                        {matchDesglose.ubicacion.estado === 'region_exacta'
                          ? tEgresado('sameCountryAndRegion')
                          : matchDesglose.ubicacion.estado === 'mismo_pais'
                            ? tEgresado('sameCountry')
                            : tEgresado('matchLocationDifferent')}
                      </span>
                    </div>
                  )}
                {matchDesglose.historial.estado !== 'ninguno' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        matchDesglose.historial.estado === 'finalizada'
                          ? 'bg-accent'
                          : 'bg-magenta'
                      }`}
                    />
                    <span>
                      {matchDesglose.historial.estado === 'finalizada'
                        ? tEgresado('matchHistoryFinalized')
                        : tEgresado('matchHistoryCancelled')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Biografía */}
        <div className="space-y-3">
          <SectionLabel>{t('bioSection')}</SectionLabel>
          {profile.descripcion ? (
            <div className="rounded-xl border border-border bg-surface-sunken p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground prose-body">
                {profile.descripcion}
              </p>
            </div>
          ) : (
            <EmptySectionHint icon={FileText} label={t('noBio')} />
          )}
        </div>

        {/* Habilidades */}
        <div className="space-y-3">
          <SectionLabel>{t('skillsSection')}</SectionLabel>
          {profile.skills.length === 0 ? (
            <EmptySectionHint icon={Layers} label={t('noSkills')} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => {
                const levelLabel =
                  skill.level === 'avanzado'
                    ? t('levelAdvanced')
                    : skill.level === 'intermedio'
                      ? t('levelIntermediate')
                      : t('levelBasic')

                const pillStyle =
                  skill.level === 'avanzado'
                    ? {
                        background:
                          'linear-gradient(135deg, color-mix(in oklch, var(--primary) 15%, transparent), color-mix(in oklch, var(--secondary) 10%, transparent))',
                        borderColor:
                          'color-mix(in oklch, var(--primary) 40%, transparent)',
                        color: 'var(--primary)',
                      }
                    : skill.level === 'intermedio'
                      ? {
                          background:
                            'color-mix(in oklch, var(--secondary) 10%, transparent)',
                          borderColor:
                            'color-mix(in oklch, var(--secondary) 35%, transparent)',
                          color: 'var(--secondary)',
                        }
                      : {
                          background: 'var(--surface-sunken)',
                          borderColor: 'var(--border)',
                          color: 'var(--ink-muted)',
                        }

                return (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm"
                    style={pillStyle}
                  >
                    {skill.name}
                    <span className="opacity-60 font-normal">
                      · {levelLabel}
                    </span>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Lo que declaras */}
        <SectionLabel>{t('declaredSectionLabel')}</SectionLabel>

        {/* Proyectos del portafolio */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-heading">
            {t('projectsSection')}
          </p>
          {profile.projects.length === 0 ? (
            <EmptySectionHint icon={FolderGit2} label={t('noProjects')} />
          ) : (
            <div className="space-y-3">
              {profile.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="group space-y-2.5 rounded-xl border border-border border-l-[3px] border-l-primary bg-surface-sunken p-4 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
                >
                  {proj.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-foreground leading-snug">
                      {proj.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {proj.completionDate && (
                        <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                          {new Date(proj.completionDate).toLocaleDateString(
                            locale,
                          )}
                        </span>
                      )}
                      {reportable && (
                        <ReportButton
                          target={{ tipo: 'portafolio', id: proj.id }}
                          iconOnly
                        />
                      )}
                    </span>
                  </div>
                  {proj.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed prose-body">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                          style={{
                            background:
                              'color-mix(in oklch, var(--secondary) 12%, transparent)',
                            border:
                              '1px solid color-mix(in oklch, var(--secondary) 30%, transparent)',
                            color: 'var(--secondary)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 pt-0.5 text-xs">
                    {proj.repositoryUrl && (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary font-semibold hover:underline"
                      >
                        <GitBranch className="h-3 w-3" /> {t('repo')}
                      </a>
                    )}
                    {proj.demoUrl && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="flex cursor-pointer items-center gap-1 text-primary font-semibold hover:underline">
                            <ExternalLink className="h-3 w-3" /> {t('demo')}
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          showCloseButton={false}
                          className="flex h-[80vh] max-w-4xl flex-col gap-0 overflow-hidden rounded-xl bg-surface p-0"
                        >
                          <DialogHeader className="flex flex-row items-center border-b border-border/60 bg-canvas/60 p-3">
                            <div className="flex items-center gap-2 pl-1">
                              <DialogClose asChild>
                                <button
                                  className="h-3 w-3 rounded-full bg-magenta hover:opacity-80 focus:outline-none"
                                  aria-label={t('closeModal')}
                                />
                              </DialogClose>
                              <a
                                href={proj.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-3 w-3 rounded-full bg-success hover:opacity-80 focus:outline-none"
                                aria-label={t('openInNewWindow')}
                              />
                            </div>
                            <DialogTitle className="flex-1 pr-10 text-center text-xs font-medium text-muted-foreground">
                              {proj.title} {t('demo')}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="relative w-full flex-1 bg-canvas/30">
                            <iframe
                              src={proj.demoUrl}
                              className="h-full w-full border-0"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmado por empresas */}
        <SectionLabel accent icon={<BadgeCheck className="h-3.5 w-3.5" />}>
          {t('confirmedSectionLabel')}
        </SectionLabel>

        {/* Proyectos completados */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-heading">
            {t('completedProjectsSection')}
          </p>
          {proyectosCompletados.length === 0 ? (
            <EmptySectionHint
              icon={Briefcase}
              label={t('noCompletedProjects')}
            />
          ) : (
            <ul className="space-y-2">
              {proyectosCompletados.map((p) => (
                <li
                  key={p.id_participacion}
                  className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 border-l-[3px] border-l-accent px-4 py-3 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:border-accent/50"
                  style={{
                    background:
                      'color-mix(in oklch, var(--accent) 8%, transparent)',
                  }}
                >
                  <span className="text-sm font-medium text-foreground">
                    {p.tituloProyecto}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-accent">
                    {p.nombreEmpresa}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Calificaciones recibidas */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-heading">
            {t('ratingsSection')}
          </p>
          {calificaciones.length === 0 ? (
            <EmptySectionHint icon={Star} label={t('noRatings')} />
          ) : (
            <div className="space-y-3">
              {calificaciones.map((cal) => (
                <ReviewCard
                  key={cal.id_evaluacion}
                  tituloProyecto={cal.tituloProyecto}
                  nombreAutor={cal.nombreEmpresa}
                  puntuacion={cal.puntuacion}
                  comentario={cal.comentario}
                  evaluadoAt={cal.evaluado_at}
                  replySlot={
                    cal.respuesta_evaluado ? (
                      <ReviewReply
                        label={t('ratingReply')}
                        text={cal.respuesta_evaluado}
                      />
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
