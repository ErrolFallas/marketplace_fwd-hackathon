import {
  Send,
  MessageSquare,
  FileCheck2,
  User,
  LayoutDashboard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SidebarNavItem {
  href: string
  labelKey: string
  icon: LucideIcon
  /** Si true, el item se marca activo solo con match exacto (para la raíz /egresado). */
  exact?: boolean
}

export interface SidebarNavSection {
  labelKey: string
  items: SidebarNavItem[]
}

/**
 * Navegación del sidebar del egresado, compartida entre `SidebarEgresado` y el
 * menú móvil del `Navbar` (donde el sidebar está oculto y estos ítems eran
 * inalcanzables). Fuente única de rutas, labels e iconos para no duplicarlos.
 * Los `labelKey` se resuelven con `useTranslations('Nav')` en cada consumidor.
 */
export const EGRESADO_SIDEBAR_NAV: SidebarNavSection[] = [
  {
    labelKey: 'menuSection',
    items: [
      {
        href: '/egresado',
        labelKey: 'dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
      { href: '/egresado/applications', labelKey: 'applications', icon: Send },
      {
        href: '/egresado/contrataciones',
        labelKey: 'myContracts',
        icon: FileCheck2,
      },
      { href: '/egresado/mensajes', labelKey: 'messages', icon: MessageSquare },
    ],
  },
  {
    labelKey: 'accountSection',
    items: [{ href: '/egresado/perfil', labelKey: 'profile', icon: User }],
  },
]
