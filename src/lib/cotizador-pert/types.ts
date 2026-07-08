/**
 * Contratos de dominio del Cotizador PERT. Módulo PURO: sin `server-only`, sin
 * imports de IA ni de red — el cliente lo importa directo para recalcular en
 * vivo. La cotización es A FUTURO y determinista: sale de las horas M
 * auto-reportadas por el egresado + los datos duros del doc de metodología
 * (docs/informativos/cotizacion_freelancer.md, Costa Rica).
 */

/** Los 6 módulos que el egresado cotiza por horas. Orden de render. */
export const MODULOS_PERT = [
  'analisis_diseno',
  'frontend',
  'backend',
  'base_datos',
  'pruebas_calidad',
  'despliegue',
] as const

export type ModuloPert = (typeof MODULOS_PERT)[number]

export type Idioma = 'es' | 'bilingue' | 'ingles'

export type TipoDespliegue = 'gratuito' | 'pago' | 'propio'

/** Horas por módulo. Misma forma para M y para cada escenario O/M/P/Beta. */
export type HorasPorModulo = Record<ModuloPert, number>

/** Estimación de tres puntos (PERT) de un módulo. */
export interface TresPuntos {
  /** Optimista (menos horas). */
  o: number
  /** Más probable — el ancla que pone el egresado. */
  m: number
  /** Pesimista (más horas). */
  p: number
}

export interface Suscripcion {
  nombre: string
  costoUsdMes: number
  activa: boolean
}

export interface Despliegue {
  tipo: TipoDespliegue
  /** Solo aplica a `pago`: costo mensual del servidor en USD. */
  costoServerUsdMes: number
  /** Solo aplica a `pago`: meses de cobertura cotizados. */
  mesesCobertura: number
}

/** Insumos: horas M del egresado + los no horarios (idioma, despliegue, subs). */
export interface CotizadorInput {
  horasM: HorasPorModulo
  idioma: Idioma
  despliegue: Despliegue
  suscripciones: Suscripcion[]
  /** Tipo de cambio ₡/$; por defecto TC_REF. */
  tc?: number
}

/** Costo de UN escenario (O, M, P o Beta), con su desglose. */
export interface EscenarioCosto {
  horasPorModulo: HorasPorModulo
  horasTotal: number
  tarifaEfectiva: number
  costoPorModulo: HorasPorModulo
  /** Infra de despliegue (recargo 15% si gratuito | server×meses×TC si pago | 0 si propio). */
  infra: number
  /** Suscripciones activas convertidas a ₡. */
  subsTotal: number
  subtotal: number
  margen: number
  totalCrc: number
  totalUsd: number
}

/** De dónde salieron los rangos O/P: propuesta de la IA o derivados de M. */
export type FuenteOP = 'ia' | 'fallback'

/** Reconciliación del cobro-M del egresado vs el cobro esperado (Beta). */
export type AlineacionM = 'm_alineado' | 'm_muy_optimista' | 'm_muy_pesimista'

/** Salida completa de la calculadora. */
export interface CotizacionResultado {
  escenarios: {
    optimista: EscenarioCosto
    masProbable: EscenarioCosto
    pesimista: EscenarioCosto
    /** Valor esperado PERT-Beta. */
    esperado: EscenarioCosto
  }
  /** Rangos por módulo ya saneados (0 ≤ O ≤ M ≤ P). */
  tresPorModulo: Record<ModuloPert, TresPuntos>
  sigmaTotalHoras: number
  /** Banda de confianza ~68% sobre el cobro esperado. */
  bandaEsperadoCrc: { min: number; max: number }
  alineacionM: AlineacionM
  fuenteOP: FuenteOP
  /** Datos que se muestran pero NO inflan el precio. */
  informativo: {
    horasBaseM: number
    horasConBufferM: number
    mesesAprox: number
  }
}

// ---------------------------------------------------------------------------
// Capa IA (advisory). Solo estructuras de datos: seguras para importar en el
// cliente (el I/O y el SDK viven en módulos server-only aparte).
// ---------------------------------------------------------------------------

/** Rango O/P propuesto por la IA para un módulo (la M la pone el egresado). */
export interface RangoOP {
  o: number
  p: number
}

/** Propuesta de rangos por módulo (parcial: la IA puede omitir módulos). */
export type RangosPropuestos = Partial<Record<ModuloPert, RangoOP>>

/** Stack detectado en el repo público de GitHub del egresado. */
export interface StackReport {
  owner: string
  repo: string
  lenguajes: string[]
  dependencias: string[]
  /** Unión de lenguajes + dependencias (nombres crudos, sin duplicar). */
  detectadas: string[]
}

/** Contraste entre el stack detectado y el requerido por el proyecto. */
export interface ContrasteStack {
  coinciden: string[]
  faltantes: string[]
}

/** Entrada del prompt: contexto del proyecto + M por módulo + stack detectado. */
export interface ProponerRangosInput {
  projectTitle: string
  projectDescription: string
  tecnologiasRequeridas: string[]
  stackDetectado: string[]
  horasM: HorasPorModulo
}

/** Resultado de la estimación IA (advisory). Nunca calcula dinero. */
export interface EstimacionIaResultado {
  propuesta: RangosPropuestos
  fuenteOP: FuenteOP
  stack: StackReport | null
  contraste: ContrasteStack | null
  /** Códigos i18n de avisos (repo no leído, IA no disponible, etc.). */
  avisos: string[]
}
