'use client'

import { useState } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  Send,
  MessageSquare,
  FileCheck2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export function SidebarEgresado() {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const { currentUser } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => setIsCollapsed((prev) => !prev)

  const studentName =
    (typeof currentUser?.user_metadata?.['full_name'] === 'string'
      ? currentUser.user_metadata['full_name']
      : undefined) ??
    currentUser?.email?.split('@')[0] ??
    t('defaultStudentName')

  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const studentRole = `${t('roleEgresado')} FWD`

  const navLinks = [
    { href: '/egresado/applications', label: t('applications'), icon: Send },
    { href: '/egresado/mensajes', label: t('messages'), icon: MessageSquare },
    {
      href: '/egresado/contrataciones',
      label: t('myContracts'),
      icon: FileCheck2,
    },
  ]

  const accountLinks = [
    { href: '/egresado/configuracion', label: t('settings'), icon: Settings },
    { href: '/egresado/ayuda', label: t('help'), icon: HelpCircle },
  ]

  return (
    <div
      className={cn(
        'relative z-20 hidden md:block h-full transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] shrink-0',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      <aside
        id="sidebar"
        className="flex flex-col bg-secondary text-secondary-foreground overflow-hidden h-full w-full"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M0 0 L30 30 L0 60 Z M60 0 L30 30 L60 60 Z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Perfil del Usuario */}
        <div className={cn('p-6 z-10', isCollapsed ? 'items-center px-4' : '')}>
          <div
            className={cn(
              'flex items-center gap-3',
              isCollapsed ? 'justify-center' : '',
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/10 text-secondary-foreground font-heading font-bold">
              {initials || 'E'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-heading text-sm font-bold text-secondary-foreground">
                  {studentName}
                </span>
                <span className="truncate font-body text-xs text-secondary-foreground/60 font-medium">
                  {studentRole}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 z-10">
          {/* Sección Menú */}
          <div className="mb-6">
            {!isCollapsed && (
              <div className="px-6 mb-2">
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary-foreground/50">
                  {t('menuSection')}
                </span>
              </div>
            )}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                // Exact match for dashboard to prevent matching everything
                const exactMatch =
                  link.href === '/egresado'
                    ? pathname === '/egresado'
                    : isActive

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={isCollapsed ? link.label : undefined}
                    className={cn(
                      'group flex items-center gap-3 px-6 py-2.5 font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                      exactMatch
                        ? 'bg-gradient-to-r from-primary to-magenta text-secondary-foreground shadow-md'
                        : 'text-secondary-foreground/75 hover:bg-secondary-foreground/10 hover:text-secondary-foreground/90',
                      !isCollapsed && exactMatch
                        ? 'rounded-full mr-4 ml-2'
                        : '',
                      isCollapsed && exactMatch ? 'rounded-full mx-2' : '',
                      isCollapsed ? 'justify-center px-0' : '',
                    )}
                  >
                    <link.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        exactMatch
                          ? 'text-secondary-foreground'
                          : 'text-secondary-foreground/60 group-hover:text-secondary-foreground/90',
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate text-sm">{link.label}</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Sección Cuenta */}
          <div>
            {!isCollapsed && (
              <div className="px-6 mb-2">
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-secondary-foreground/50">
                  {t('accountSection')}
                </span>
              </div>
            )}
            <nav className="space-y-1">
              {accountLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={isCollapsed ? link.label : undefined}
                    className={cn(
                      'group flex items-center gap-3 px-6 py-2.5 font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-magenta text-secondary-foreground shadow-md'
                        : 'text-secondary-foreground/75 hover:bg-secondary-foreground/10 hover:text-secondary-foreground/90',
                      !isCollapsed && isActive ? 'rounded-full mr-4 ml-2' : '',
                      isCollapsed && isActive ? 'rounded-full mx-2' : '',
                      isCollapsed ? 'justify-center px-0' : '',
                    )}
                  >
                    <link.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-secondary-foreground'
                          : 'text-secondary-foreground/60 group-hover:text-secondary-foreground/90',
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate text-sm">{link.label}</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Botón Toggle - Colocado fuera de aside para que no sea cortado por overflow-hidden */}
      <button
        type="button"
        className="sidebar-toggle absolute -right-2 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-secondary-foreground/20 bg-secondary shadow-sm hover:bg-secondary-foreground/10 text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-secondary-foreground/40 z-30 transition-transform"
        onClick={toggleSidebar}
        role="button"
        aria-expanded={!isCollapsed}
        aria-controls="sidebar"
        aria-label={t('toggleSidebar')}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-secondary-foreground" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-secondary-foreground" />
        )}
      </button>
    </div>
  )
}
