import {
  Send,
  MessageSquare,
  FileCheck2,
  Settings,
  HelpCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SidebarNavItem {
  href: string
  labelKey: string
  icon: LucideIcon
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
      { href: '/egresado/applications', labelKey: 'applications', icon: Send },
      { href: '/egresado/mensajes', labelKey: 'messages', icon: MessageSquare },
      {
        href: '/egresado/contrataciones',
        labelKey: 'myContracts',
        icon: FileCheck2,
      },
    ],
  },
  {
    labelKey: 'accountSection',
    items: [
      { href: '/egresado/configuracion', labelKey: 'settings', icon: Settings },
      { href: '/egresado/ayuda', labelKey: 'help', icon: HelpCircle },
    ],
  },
]
