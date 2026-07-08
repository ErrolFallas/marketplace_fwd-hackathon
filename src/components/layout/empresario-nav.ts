import { Send, Users, MessageSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface EmpresarioNavItem {
  href: string
  labelKey: string
  icon: LucideIcon
}

/**
 * Navegación del sidebar del empresario, compartida entre `SidebarEmpresaNuevo`
 * y el menú móvil del `Navbar` (donde el sidebar está oculto y estos ítems
 * eran inalcanzables). Los `labelKey` se resuelven con
 * `useTranslations('EmpresaPerfil')` en cada consumidor.
 */
export const EMPRESARIO_SIDEBAR_NAV: EmpresarioNavItem[] = [
  {
    href: '/empresario/postulaciones',
    labelKey: 'menuPostulaciones',
    icon: Send,
  },
  {
    href: '/empresario/contrataciones',
    labelKey: 'menuContrataciones',
    icon: Users,
  },
  {
    href: '/empresario/mensajes',
    labelKey: 'menuMensajes',
    icon: MessageSquare,
  },
]
