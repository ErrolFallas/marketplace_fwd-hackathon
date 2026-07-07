export type WorkMode = 'remoto' | 'hibrido' | 'presencial'

export type Currency = 'USD' | 'CRC'

export type ProjectStatus = 'draft' | 'active' | 'closed' | 'pending'

export type ApplicationStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'

export type CompanyStatus = 'pending' | 'approved' | 'rejected'

export type CompanyType = 'formal' | 'emprendedor'

export interface Project {
  id: string
  title: string
  companyId: string
  companyName: string
  description: string
  /** Criterios de aceptación para el programador (RF-57); [] si el proyecto no los tiene. */
  requerimientosFuncionales: string[]
  stack: string[]
  durationDays: number | null // duración real en días (cierre - publicación); null si falta fecha
  budget: number // monto representativo (max ?? min) en la moneda del proyecto; para display simple
  currency: Currency
  budgetMin: number | null
  budgetMax: number | null
  mode: WorkMode
  startDate: string // ISO date string (fecha_publicacion)
  closingDate: string | null // ISO (fecha_cierre); deadline de postulación, null si falta
  status: ProjectStatus
  createdAt: string
  category?: string | undefined
  area?: string | undefined
  countryIso?: string | null
  region?: string | null
  matchScore?: number | undefined
  matchDetalles?: import('@/lib/projects/match-logic').MatchDetail[] | undefined
}

export interface Application {
  id: string
  projectId: string
  projectTitle: string
  companyId: string
  companyName: string
  candidateName: string
  candidateEmail: string
  coverLetter: string
  portfolioUrl: string
  cvUrl: string
  status: ApplicationStatus
  createdAt: string
}

export interface Company {
  id: string
  name: string
  companyType: CompanyType
  sector: string
  cedula: string
  description: string
  logo: string
  status: CompanyStatus
  projectsCount: number
  contactEmail: string
  website: string
  reputacion?: number | null
  createdAt: string
  isProfileFilled?: boolean | undefined
  userId?: string | undefined
}

export type UserRole = 'egresado' | 'empresario' | 'administrador'

export type SkillLevel = 'basico' | 'intermedio' | 'avanzado'

export interface StudentSkill {
  id: string
  name: string
  level: SkillLevel
}

export interface PortfolioProject {
  id: string
  title: string
  description: string
  technologies: string[]
  completionDate?: string
  repositoryUrl?: string
  demoUrl?: string
  imageUrl?: string
  /**
   * Presente solo cuando el proyecto se declara a partir de una
   * participación finalizada real (ver `origen_portafolio_enum`).
   * Dispara el flujo de consentimiento en `savePortfolioProject`.
   */
  idParticipacion?: string
}

export interface StudentPortfolio {
  studentId: string
  bio: string
  visibility: 'publico' | 'empresas'
  skills: StudentSkill[]
  projects: PortfolioProject[]
}
