'use client'

import { useState } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/lib/auth/AuthContext'
import { EGRESADO_SIDEBAR_NAV } from './egresado-nav'

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

  const initials =
    studentName
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'E'

  const studentRole = `${t('roleEgresado')} FWD`

  return (
    <div
      className={cn(
        'relative z-20 hidden h-full shrink-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] md:block',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      <aside
        id="sidebar"
        className="flex h-full w-full flex-col overflow-hidden bg-secondary text-secondary-foreground"
      >
        {/* Perfil */}
        <div
          className={cn(
            'flex items-center gap-3 p-5',
            isCollapsed && 'justify-center px-0',
          )}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/15 font-heading text-sm font-bold">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-heading text-sm font-bold">
                {studentName}
              </span>
              <span className="truncate font-body text-xs font-medium text-secondary-foreground/70">
                {studentRole}
              </span>
            </div>
          )}
        </div>

        {/* Navegación */}
        <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 pb-4">
          {EGRESADO_SIDEBAR_NAV.map((section) => (
            <div key={section.labelKey}>
              {!isCollapsed && (
                <p className="mb-2 px-3 font-heading text-[10px] font-bold uppercase tracking-wider text-secondary-foreground/60">
                  {t(section.labelKey)}
                </p>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? t(item.labelKey) : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                        isActive
                          ? 'bg-gradient-to-r from-primary to-magenta text-secondary-foreground shadow-md'
                          : 'text-secondary-foreground/85 hover:bg-secondary-foreground/10',
                        isCollapsed && 'justify-center px-0',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-5 shrink-0',
                          isActive
                            ? 'text-secondary-foreground'
                            : 'text-secondary-foreground/70',
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{t(item.labelKey)}</span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      {/* Toggle (fuera del aside para no recortarse con overflow-hidden) */}
      <button
        type="button"
        className="absolute -right-2 top-6 z-30 flex size-6 items-center justify-center rounded-full border border-secondary-foreground/20 bg-secondary text-secondary-foreground shadow-sm transition-transform hover:bg-secondary-foreground/10 focus:outline-none focus:ring-2 focus:ring-secondary-foreground/40"
        onClick={toggleSidebar}
        aria-expanded={!isCollapsed}
        aria-controls="sidebar"
        aria-label={t('toggleSidebar')}
      >
        {isCollapsed ? (
          <ChevronRight className="size-3.5 text-secondary-foreground" />
        ) : (
          <ChevronLeft className="size-3.5 text-secondary-foreground" />
        )}
      </button>
    </div>
  )
}
