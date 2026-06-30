'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import {
  LayoutDashboard,
  Send,
  MessageSquare,
  HelpCircle,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSidebarHidden } from '@/hooks/use-sidebar-hidden'
import { useAuth } from '@/lib/auth/AuthContext'
import { SoporteDialog } from '@/components/features/shared/SoporteDialog'

interface NavItem {
  id: string
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: (pathname: string) => boolean
}

export function SidebarEmpresaNuevo() {
  const t = useTranslations('EmpresaPerfil')
  const tNav = useTranslations('Nav')
  const tSoporte = useTranslations('Soporte')
  const pathname = usePathname()
  const { displayName } = useAuth()
  const { isHidden, toggle } = useSidebarHidden()

  // El sidebar colapsa a un riel de iconos en desktop (igual que el egresado),
  // no se oculta por completo. En móvil sigue siendo una card completa: los
  // estilos de colapso van prefijados con `lg:` para no afectar el móvil.
  const collapsed = isHidden

  const companyRole = `${tNav('roleEmpresa')} FWD`
  const companyName = displayName ?? companyRole
  const initials =
    (displayName
      ?.split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ??
      '') ||
    'E'

  // El highlight sigue la SECCIÓN, no solo la URL exacta: las subrutas de
  // proyecto/new-project cuentan como Panel; formulario-empresa como Perfil.
  const navItems: NavItem[] = [
    {
      id: 'panel',
      href: '/empresario',
      label: t('menuPanel'),
      icon: LayoutDashboard,
      isActive: (path) =>
        path === '/empresario' ||
        path.startsWith('/empresario/proyecto') ||
        path.startsWith('/empresario/new-project'),
    },
    {
      id: 'postulaciones',
      href: '/empresario/postulaciones',
      label: t('menuPostulaciones'),
      icon: Send,
      isActive: (path) => path.startsWith('/empresario/postulaciones'),
    },
    {
      id: 'contrataciones',
      href: '/empresario/contrataciones',
      label: t('menuContrataciones'),
      icon: Users,
      isActive: (path) => path.startsWith('/empresario/contrataciones'),
    },
    {
      id: 'mensajes',
      href: '/empresario/mensajes',
      label: t('menuMensajes'),
      icon: MessageSquare,
      isActive: (path) => path.startsWith('/empresario/mensajes'),
    },
  ]

  return (
    <aside
      id="empresario-sidebar"
      className={cn(
        'relative flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-secondary-foreground/10 bg-secondary text-secondary-foreground shadow-lg transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:rounded-none lg:border-none lg:border-r lg:shadow-none',
        collapsed ? 'lg:w-20' : 'lg:w-64',
      )}
    >
      {/* Perfil + toggle */}
      <div
        className={cn(
          'flex items-center gap-3 p-5',
          collapsed && 'lg:flex-col lg:gap-2 lg:px-2',
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/15 font-heading text-sm font-bold">
          {initials}
        </div>
        <div
          className={cn(
            'flex flex-1 flex-col overflow-hidden',
            collapsed && 'lg:hidden',
          )}
        >
          <span className="truncate font-heading text-sm font-bold">
            {companyName}
          </span>
          <span className="truncate font-body text-xs font-medium text-secondary-foreground/70">
            {companyRole}
          </span>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? tNav('showSidebar') : tNav('hideSidebar')}
          aria-expanded={!collapsed}
          aria-controls="empresario-sidebar"
          className="hidden shrink-0 items-center justify-center rounded-lg p-1.5 text-secondary-foreground/70 transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-secondary-foreground/10 hover:text-secondary-foreground lg:inline-flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <PanelLeftClose className="size-4 shrink-0" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div>
          <p
            className={cn(
              'mb-2 px-3 font-heading text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/60',
              collapsed && 'lg:hidden',
            )}
          >
            {tNav('menuSection')}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = item.isActive(pathname)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                    active
                      ? 'bg-gradient-to-r from-primary to-magenta text-secondary-foreground shadow-md'
                      : 'text-secondary-foreground/85 hover:bg-secondary-foreground/10',
                    collapsed && 'lg:justify-center lg:px-0',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-5 shrink-0',
                      active
                        ? 'text-secondary-foreground'
                        : 'text-secondary-foreground/70',
                    )}
                  />
                  <span className={cn('truncate', collapsed && 'lg:hidden')}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <p
            className={cn(
              'mb-2 px-3 font-heading text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/60',
              collapsed && 'lg:hidden',
            )}
          >
            {tNav('accountSection')}
          </p>
          <nav className="space-y-1">
            <Link
              href="/empresario/perfil"
              title={tNav('profile')}
              aria-current={
                pathname.startsWith('/empresario/perfil') ? 'page' : undefined
              }
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                pathname.startsWith('/empresario/perfil')
                  ? 'bg-gradient-to-r from-primary to-magenta text-secondary-foreground shadow-md'
                  : 'text-secondary-foreground/85 hover:bg-secondary-foreground/10',
                collapsed && 'lg:justify-center lg:px-0',
              )}
            >
              <User className="size-5 shrink-0 text-secondary-foreground/70" />
              <span className={cn('truncate', collapsed && 'lg:hidden')}>
                {tNav('profile')}
              </span>
            </Link>
            <SoporteDialog>
              <button
                type="button"
                title={tSoporte('triggerLabel')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-secondary-foreground/85 transition-all hover:bg-secondary-foreground/10',
                  collapsed && 'lg:justify-center lg:px-0',
                )}
              >
                <HelpCircle className="size-5 shrink-0 text-secondary-foreground/70" />
                <span className={cn('truncate', collapsed && 'lg:hidden')}>
                  {tSoporte('triggerLabel')}
                </span>
              </button>
            </SoporteDialog>
          </nav>
        </div>
      </div>
    </aside>
  )
}
