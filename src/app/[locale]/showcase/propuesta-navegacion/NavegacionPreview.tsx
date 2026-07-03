'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Send,
  MessageSquare,
  FileCheck2,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  FolderOpen,
  Menu,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  ShieldAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { FwdLogo } from '@/components/features/brand/FwdLogo'

interface SidebarItem {
  label: string
  icon: LucideIcon
  active?: boolean
}

interface SidebarSection {
  label: string
  items: SidebarItem[]
}

interface SidebarModel {
  name: string
  initials: string
  role: string
  sections: SidebarSection[]
}

// ── Sidebar unificado (props-driven): mismo patrón para egresado y empresario.
// Mejoras vs. los dos componentes reales: contraste subido (inactivo /85, iconos
// /70, labels /60), pill activo rounded-xl ancho completo, perfil + secciones +
// logout consistentes, y soporta colapsado.
function AppSidebar({
  model,
  logoutLabel,
  collapsed = false,
  className,
}: {
  model: SidebarModel
  logoutLabel: string
  collapsed?: boolean
  className?: string | undefined
}) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col overflow-hidden bg-secondary text-secondary-foreground transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]',
        collapsed ? 'w-20' : 'w-64',
        className,
      )}
    >
      {/* Perfil */}
      <div
        className={cn(
          'flex items-center gap-3 p-5',
          collapsed && 'justify-center px-0',
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/15 font-heading text-sm font-bold">
          {model.initials}
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-heading text-sm font-bold">
              {model.name}
            </span>
            <span className="truncate font-body text-xs font-medium text-secondary-foreground/70">
              {model.role}
            </span>
          </div>
        )}
      </div>

      {/* Navegación por secciones */}
      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {model.sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 font-heading text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/60">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                    item.active
                      ? 'bg-gradient-to-r from-primary to-magenta text-secondary-foreground shadow-md'
                      : 'text-secondary-foreground/85 hover:bg-secondary-foreground/10',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <item.icon
                    className={cn(
                      'size-5 shrink-0',
                      item.active
                        ? 'text-secondary-foreground'
                        : 'text-secondary-foreground/70',
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: logout consistente en ambos roles */}
      <div className="px-3 pb-4">
        <div className="mb-2 h-px bg-secondary-foreground/10" />
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary-foreground/70 hover:bg-secondary-foreground/10',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="size-5 shrink-0 text-secondary-foreground/70" />
          {!collapsed && <span>{logoutLabel}</span>}
        </div>
      </div>
    </aside>
  )
}

interface NavLinkModel {
  label: string
  icon: LucideIcon
  active?: boolean
}

function NavbarPreview({
  roleLabel,
  links,
  verified,
  verifiedLabel,
  unverifiedLabel,
}: {
  roleLabel: string
  links: NavLinkModel[]
  verified: boolean
  verifiedLabel: string
  unverifiedLabel: string
}) {
  return (
    <div className="flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <FwdLogo className="size-12" />
        <span className="font-heading text-lg font-bold tracking-tight">
          Marketplace FWD<span className="text-primary">.</span>
        </span>
      </div>

      <div className="hidden items-center gap-1 lg:flex">
        {links.map((link) => (
          <span
            key={link.label}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold',
              link.active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground',
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-bold sm:flex">
          <span className="size-2 rounded-full bg-primary" />
          {roleLabel}
        </div>
        {/* Estado de verificación (estudiantes/empresarios según el rol) */}
        {verified ? (
          <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent sm:flex">
            <BadgeCheck className="size-3.5" />
            {verifiedLabel}
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-bold text-warning sm:flex">
            <ShieldAlert className="size-3.5" />
            {unverifiedLabel}
          </span>
        )}
        <div className="flex items-center rounded-full border border-border/60 bg-muted/30 p-0.5">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            ES
          </span>
          <span className="px-3 py-1 text-xs font-bold text-muted-foreground">
            EN
          </span>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
          <Bell className="size-4" />
        </span>
        <span className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-muted-foreground">
          AV
        </span>
      </div>
    </div>
  )
}

// Placeholder de contenido para dar contexto de "app real" al lado del sidebar.
function ContentPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex-1 space-y-4 bg-canvas p-6">
      <h3 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
        {title}
        <span className="text-primary">.</span>
      </h3>
      <div className="space-y-3">
        <div className="h-20 rounded-2xl border border-border bg-surface" />
        <div className="h-20 rounded-2xl border border-border bg-surface" />
      </div>
    </div>
  )
}

function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="font-heading text-xl font-bold tracking-tight text-ink-strong">
        {title}
        <span className="text-primary">.</span>
      </h2>
      <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function NavegacionPreview() {
  const tNav = useTranslations('Nav')
  const tEmpresa = useTranslations('EmpresaPerfil')
  const [collapsed, setCollapsed] = useState(false)

  const logoutLabel = tNav('logout')

  const egresado: SidebarModel = {
    name: 'Ana Vargas',
    initials: 'AV',
    role: `${tNav('roleEgresado')} FWD`,
    sections: [
      {
        label: tNav('menuSection'),
        items: [
          { label: tNav('applications'), icon: Send, active: true },
          { label: tNav('messages'), icon: MessageSquare },
          { label: tNav('myContracts'), icon: FileCheck2 },
        ],
      },
      {
        label: tNav('accountSection'),
        items: [
          { label: tNav('settings'), icon: Settings },
          { label: tNav('help'), icon: HelpCircle },
        ],
      },
    ],
  }

  const empresario: SidebarModel = {
    name: 'Estudio Lumen',
    initials: 'EL',
    role: `${tNav('roleEmpresa')} FWD`,
    sections: [
      {
        label: tNav('menuSection'),
        items: [
          { label: tEmpresa('menuPanel'), icon: LayoutDashboard, active: true },
          { label: tEmpresa('menuPostulaciones'), icon: Send },
          { label: tEmpresa('menuContrataciones'), icon: Users },
          { label: tEmpresa('menuMensajes'), icon: MessageSquare },
        ],
      },
      {
        label: tNav('accountSection'),
        items: [{ label: tEmpresa('menuAyuda'), icon: HelpCircle }],
      },
    ],
  }

  const navLinks: NavLinkModel[] = [
    { label: tNav('dashboard'), icon: LayoutDashboard, active: true },
    { label: tNav('searchProjects'), icon: Search },
    { label: tNav('portfolio'), icon: FolderOpen },
  ]

  return (
    <div className="space-y-12">
      {/* Navbar */}
      <section className="space-y-4">
        <SectionHeading
          title="Navbar"
          description="Ahora con estado de verificación, leído de estudiantes (egresado) o empresarios (empresario) según el rol. Se muestran los dos estados."
        />
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-border">
            <NavbarPreview
              roleLabel={tNav('roleEgresado')}
              links={navLinks}
              verified
              verifiedLabel={tNav('verified')}
              unverifiedLabel={tNav('unverified')}
            />
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            Estado: verificado (badge teal con check).
          </p>
        </div>
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-border">
            <NavbarPreview
              roleLabel={tNav('roleEgresado')}
              links={navLinks}
              verified={false}
              verifiedLabel={tNav('verified')}
              unverifiedLabel={tNav('unverified')}
            />
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            Estado: sin verificar (badge naranja de atención).
          </p>
        </div>
      </section>

      {/* Desktop expandido — consistencia entre roles */}
      <section className="space-y-4">
        <SectionHeading
          title="Consistencia entre roles"
          description="El mismo AppSidebar para egresado y empresario: perfil, secciones agrupadas, pill activo y logout idénticos. Antes divergían (rounded-full vs rounded-xl, con/sin perfil, logout en navbar vs sidebar)."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex h-[440px] overflow-hidden rounded-2xl border border-border">
            <AppSidebar model={egresado} logoutLabel={logoutLabel} />
            <ContentPlaceholder title={tNav('roleEgresado')} />
          </div>
          <div className="flex h-[440px] overflow-hidden rounded-2xl border border-border">
            <AppSidebar model={empresario} logoutLabel={logoutLabel} />
            <ContentPlaceholder title={tNav('roleEmpresa')} />
          </div>
        </div>
      </section>

      {/* Colapsado (interactivo) */}
      <section className="space-y-4">
        <SectionHeading
          title="Colapsado"
          description="Toggle para colapsar a iconos. Mismo mecanismo para ambos roles (antes egresado usaba useState y empresario un hook distinto)."
        />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-strong transition-colors hover:bg-muted"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
            {collapsed ? 'Expandir' : 'Colapsar'}
          </button>
        </div>
        <div className="flex h-[440px] w-fit overflow-hidden rounded-2xl border border-border">
          <AppSidebar
            model={egresado}
            logoutLabel={logoutLabel}
            collapsed={collapsed}
          />
          <ContentPlaceholder title={tNav('roleEgresado')} />
        </div>
      </section>

      {/* Móvil — drawer off-canvas */}
      <section className="space-y-4">
        <SectionHeading
          title="Móvil (375px) — drawer"
          description="Cierra el hueco real: hoy el sidebar del egresado es hidden md:block, así que en móvil pierde Postulaciones, Mensajes y Contratos. Acá entra como drawer off-canvas desde el navbar."
        />
        <div className="w-[375px] overflow-hidden rounded-3xl border border-border-strong shadow-[var(--shadow-elevated)]">
          {/* navbar móvil */}
          <div className="flex h-14 items-center justify-between border-b border-border/80 bg-background px-4">
            <div className="flex items-center gap-2">
              <FwdLogo className="size-11" />
              <span className="font-heading text-base font-bold tracking-tight">
                FWD<span className="text-primary">.</span>
              </span>
            </div>
            <span className="flex size-9 items-center justify-center rounded-lg text-ink">
              <Menu className="size-5" />
            </span>
          </div>
          {/* drawer abierto sobre backdrop */}
          <div className="relative h-[520px] bg-canvas">
            <div className="absolute inset-0 bg-ink-strong/40" />
            <div className="absolute inset-y-0 left-0">
              <AppSidebar
                model={egresado}
                logoutLabel={logoutLabel}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
