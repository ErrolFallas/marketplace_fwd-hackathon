'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
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
    <Card className="overflow-hidden border border-primary/20 bg-surface shadow-sm">
      {/* Banda arcoíris FWD: la credencial */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

      {/* === Cabecera === */}
      <CardHeader className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pb-6 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {profile.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profilePhoto}
                alt={t('photoAlt')}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-secondary-foreground ring-2 ring-primary/20 ring-offset-2">
                {profile.firstName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-display leading-tight">
                {fullName || t('studentFwdFallback')}
              </h2>
              <p className="text-sm font-semibold text-primary capitalize">
                {profile.tituloFwd || t('defaultRole')}
              </p>
              {hasReputation && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= Math.round(profile.reputacion!)
                          ? 'fill-highlight text-highlight'
                          : 'text-muted-foreground/25'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground">
                    {Number(profile.reputacion).toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </span>
                )}
                {profile.urlPortafolio && (
                  <a
                    href={profile.urlPortafolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <GitBranch className="h-3.5 w-3.5" /> {t('githubProfile')}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <Badge
              variant={visibility === 'publico' ? 'default' : 'secondary'}
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
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
              <Button asChild size="sm" variant="outline">
                <Link href={`/${locale}/egresado/portfolio`}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  {t('editPortfolio')}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Control de visibilidad (solo dueño) */}
        {isOwner && (
          <div className="mt-5 rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {t('visibilityDesc')}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={visibility === 'publico' ? 'default' : 'outline'}
                  className="gap-1.5"
                  onClick={() => handleVisibilityChange('publico')}
                  disabled={isSavingVis}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {t('visibilityPublic')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={visibility === 'empresas' ? 'default' : 'outline'}
                  className="gap-1.5"
                  onClick={() => handleVisibilityChange('empresas')}
                  disabled={isSavingVis}
                >
                  <Lock className="h-3.5 w-3.5" />
                  {t('visibilityCompanies')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-6 font-sans">
        {/* === Match score (empresa revisando a un candidato) === */}
        {matchScore !== undefined && matchDetalles !== undefined && (
          <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-primary font-display">
                {tEgresado('matchWithStudent', {
                  firstName: profile.firstName,
                  lastName: profile.lastName1,
                  score: matchScore,
                })}
              </h3>
            </div>
            {matchDetalles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('commonTechnologies')}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchDetalles.map((det) => (
                    <Badge
                      key={det.id_tecnologia}
                      variant="outline"
                      className="flex items-center gap-2 border-border bg-background px-3 py-1"
                    >
                      <span className="font-semibold text-highlight">
                        {det.nombre_tecnologia || det.id_tecnologia}
                      </span>
                      <span className="ml-1 text-[10px] uppercase text-primary">
                        ({det.nivel})
                      </span>
                      <span className="ml-1 font-bold text-primary">
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

        {/* === Biografía === */}
        <div className="space-y-2">
          <SectionLabel>{t('bioSection')}</SectionLabel>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground prose-body">
            {profile.descripcion ? (
              profile.descripcion
            ) : (
              <span className="italic text-muted-foreground">{t('noBio')}</span>
            )}
          </p>
        </div>

        {/* === Habilidades === */}
        <div className="space-y-2.5">
          <SectionLabel>{t('skillsSection')}</SectionLabel>
          {profile.skills.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              {t('noSkills')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => {
                const variant =
                  skill.level === 'avanzado'
                    ? 'default'
                    : skill.level === 'intermedio'
                      ? 'secondary'
                      : 'outline'
                const levelLabel =
                  skill.level === 'avanzado'
                    ? t('levelAdvanced')
                    : skill.level === 'intermedio'
                      ? t('levelIntermediate')
                      : t('levelBasic')
                return (
                  <Badge key={skill.id} variant={variant} className="gap-1">
                    {skill.name}
                    <span className="text-[10px] opacity-70">
                      · {levelLabel}
                    </span>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        {/* ───── Lo que declaras ───── */}
        <SectionLabel>{t('declaredSectionLabel')}</SectionLabel>

        {/* === Proyectos del portafolio === */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-display">
            {t('projectsSection')}
          </p>
          {profile.projects.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              {t('noProjects')}
            </p>
          ) : (
            <div className="space-y-3">
              {profile.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>{proj.title}</span>
                    <span className="flex items-center gap-1">
                      {proj.completionDate && (
                        <span className="text-xs font-normal text-muted-foreground">
                          (
                          {new Date(proj.completionDate).toLocaleDateString(
                            locale,
                          )}
                          )
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
                    <p className="line-clamp-2 text-xs text-muted-foreground prose-body">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-secondary/20 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1 text-xs">
                    {proj.repositoryUrl && (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-0.5 text-primary hover:underline"
                      >
                        <GitBranch className="h-3 w-3" /> {t('repo')}
                      </a>
                    )}
                    {proj.demoUrl && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="flex cursor-pointer items-center gap-0.5 text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" /> {t('demo')}
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          showCloseButton={false}
                          className="flex h-[80vh] max-w-4xl flex-col gap-0 overflow-hidden rounded-xl bg-background p-0"
                        >
                          <DialogHeader className="flex flex-row items-center border-b bg-muted/30 p-3">
                            <div className="flex items-center gap-2 pl-1">
                              <DialogClose asChild>
                                <button
                                  className="h-3 w-3 rounded-full bg-magenta hover:bg-magenta/80 focus:outline-none"
                                  aria-label={t('closeModal')}
                                />
                              </DialogClose>
                              <a
                                href={proj.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-3 w-3 rounded-full bg-success hover:bg-success/80 focus:outline-none"
                                aria-label={t('openInNewWindow')}
                              />
                            </div>
                            <DialogTitle className="flex-1 pr-10 text-center text-xs font-medium text-muted-foreground">
                              {proj.title} {t('demo')}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="relative w-full flex-1 bg-muted/10">
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

        {/* ───── Confirmado por empresas ───── */}
        <SectionLabel accent icon={<BadgeCheck className="h-3.5 w-3.5" />}>
          {t('confirmedSectionLabel')}
        </SectionLabel>

        {/* === Proyectos completados === */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-display">
            {t('completedProjectsSection')}
          </p>
          {proyectosCompletados.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              {t('noCompletedProjects')}
            </p>
          ) : (
            <ul className="space-y-2">
              {proyectosCompletados.map((p) => (
                <li
                  key={p.id_participacion}
                  className="flex items-center justify-between gap-3 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">
                    {p.tituloProyecto}
                  </span>
                  <span className="text-xs font-semibold text-accent">
                    {p.nombreEmpresa}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* === Calificaciones recibidas === */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-display">
            {t('ratingsSection')}
          </p>
          {calificaciones.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              {t('noRatings')}
            </p>
          ) : (
            <div className="space-y-3">
              {calificaciones.map((cal) => (
                <div
                  key={cal.id_evaluacion}
                  className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {cal.tituloProyecto}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        {cal.nombreEmpresa}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= cal.puntuacion
                              ? 'fill-highlight text-highlight'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {cal.comentario && (
                    <p className="border-t border-border/40 pt-2 text-xs italic leading-relaxed text-muted-foreground prose-body">
                      &quot;{cal.comentario}&quot;
                    </p>
                  )}
                  {cal.respuesta_evaluado && (
                    <div className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary">
                        {t('ratingReply')}
                      </span>
                      <p className="text-xs italic leading-relaxed text-foreground/90 prose-body">
                        {cal.respuesta_evaluado}
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/60">
                    {new Date(cal.evaluado_at).toLocaleDateString(locale)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
