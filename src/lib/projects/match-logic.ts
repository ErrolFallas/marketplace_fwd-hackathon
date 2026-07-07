import type { Database } from '@/types/database'

export type NivelHabilidad = Database['public']['Enums']['nivel_habilidad_enum']
export type Modalidad = Database['public']['Enums']['modalidad_enum']

/**
 * Desenlace del contrato previo del egresado con el MISMO empresario del
 * proyecto. Ignora la calificación en estrellas: solo importa si terminaron o
 * cancelaron (una cancelación hace poco probable que quieran repetir).
 */
export type HistorialContrato = 'ninguno' | 'finalizada' | 'cancelada'

/** Estado del factor ubicación, para explicar el desglose en la UI. */
export type UbicacionEstado =
  | 'no_aplica' // proyecto remoto
  | 'sin_dato' // falta país en el proyecto o en el egresado
  | 'distinto' // países distintos
  | 'mismo_pais' // mismo país, región distinta o sin región
  | 'region_exacta' // mismo país y misma región

export interface MatchStudentSkill {
  id_tecnologia: string
  nivel: NivelHabilidad
}

export interface MatchProjectTech {
  id_tecnologia: string
  nombre_tecnologia?: string | undefined
}

export interface MatchLocation {
  paisIso: string | null
  region: string | null
}

export interface MatchInput {
  studentSkills: MatchStudentSkill[]
  projectTechs: MatchProjectTech[]
  modalidad: Modalidad
  projectLocation: MatchLocation
  studentLocation: MatchLocation
  historial: HistorialContrato
}

export interface MatchDetail {
  id_tecnologia: string
  nombre_tecnologia?: string | undefined
  puntos: number
  nivel: NivelHabilidad
}

export interface MatchBreakdown {
  /** Proporción de dominio sobre lo que el proyecto pide (0..1). */
  tecnologiaPct: number
  /** `pct` es null cuando el factor no aplica (remoto o sin dato) y se renormaliza. */
  ubicacion: { estado: UbicacionEstado; pct: number | null }
  /** `delta` en puntos sobre 100 (positivo, negativo o cero). */
  historial: { estado: HistorialContrato; delta: number }
}

export interface MatchResult {
  /** Afinidad normalizada 0–100 (entero). Comparable entre proyectos. */
  score: number
  detalles: MatchDetail[]
  desglose: MatchBreakdown
}

const PUNTOS_POR_NIVEL: Record<NivelHabilidad, number> = {
  basico: 10,
  intermedio: 15,
  avanzado: 20,
}
/** Puntos del nivel máximo (avanzado): techo por tecnología requerida. */
const PUNTOS_NIVEL_MAX = 20

/**
 * Pesos de la base. Suman 1 cuando ambos factores aplican; si la ubicación no
 * aplica (remoto o sin dato), la tecnología se lleva el 100% (renormalización):
 * un perfil sin ubicación NO se penaliza, se puntúa por tecnología.
 */
const PESO_TECNOLOGIA = 0.65
const PESO_UBICACION = 0.35

const UBIC_REGION_EXACTA = 1
const UBIC_MISMO_PAIS = 0.5
const UBIC_DISTINTO = 0

/** Delta de historial en puntos sobre 100, acotado para no dominar la base. */
const HISTORIAL_BONO_FINALIZADA = 10
const HISTORIAL_MALUS_CANCELADA = 10

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Normaliza texto geográfico para comparar por coincidencia EXACTA: minúsculas,
 * sin acentos, sin espacios extremos. No hay catálogo ni cercanía por mapas;
 * esto solo evita los falsos negativos triviales ("San José" vs "san jose").
 */
export function normalizeGeo(value: string | null): string {
  return (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

function evaluarUbicacion(
  modalidad: Modalidad,
  project: MatchLocation,
  student: MatchLocation,
): { estado: UbicacionEstado; pct: number | null } {
  // En remoto la ubicación no pondera (se renormaliza a tecnología).
  if (modalidad === 'remoto') return { estado: 'no_aplica', pct: null }

  const projPais = normalizeGeo(project.paisIso)
  const studPais = normalizeGeo(student.paisIso)

  // Sin país en alguno de los dos: no se puede comparar → no penaliza, renormaliza.
  if (!projPais || !studPais) return { estado: 'sin_dato', pct: null }

  if (projPais !== studPais) return { estado: 'distinto', pct: UBIC_DISTINTO }

  const projRegion = normalizeGeo(project.region)
  const studRegion = normalizeGeo(student.region)
  if (projRegion && studRegion && projRegion === studRegion) {
    return { estado: 'region_exacta', pct: UBIC_REGION_EXACTA }
  }
  return { estado: 'mismo_pais', pct: UBIC_MISMO_PAIS }
}

/**
 * Afinidad egresado↔proyecto como porcentaje 0–100.
 *
 * Base = tecnología (dominio sobre lo requerido) + ubicación, con pesos
 * renormalizados sobre los factores que tienen dato. El historial con el mismo
 * empresario se suma/resta como delta acotado al final. Función pura y sin I/O.
 */
export function calculateMatchScore(input: MatchInput): MatchResult {
  const {
    studentSkills,
    projectTechs,
    modalidad,
    projectLocation,
    studentLocation,
    historial,
  } = input

  // --- Tecnología ---
  const skillsMap = new Map<string, NivelHabilidad>()
  for (const skill of studentSkills) {
    skillsMap.set(skill.id_tecnologia, skill.nivel)
  }

  const detalles: MatchDetail[] = []
  let puntosObtenidos = 0
  for (const tech of projectTechs) {
    const nivel = skillsMap.get(tech.id_tecnologia)
    if (nivel) {
      const puntos = PUNTOS_POR_NIVEL[nivel]
      puntosObtenidos += puntos
      detalles.push({
        id_tecnologia: tech.id_tecnologia,
        nombre_tecnologia: tech.nombre_tecnologia,
        nivel,
        puntos,
      })
    }
  }

  const puntosMax = projectTechs.length * PUNTOS_NIVEL_MAX
  const tecnologiaAplica = puntosMax > 0
  // Guarda de división por cero: proyecto sin tecnologías → 0, nunca NaN.
  const tecnologiaPct = tecnologiaAplica ? puntosObtenidos / puntosMax : 0

  // --- Ubicación ---
  const ubicacion = evaluarUbicacion(
    modalidad,
    projectLocation,
    studentLocation,
  )

  // --- Base renormalizada sobre los factores presentes ---
  let base: number
  if (tecnologiaAplica && ubicacion.pct !== null) {
    base = PESO_TECNOLOGIA * tecnologiaPct + PESO_UBICACION * ubicacion.pct
  } else if (tecnologiaAplica) {
    base = tecnologiaPct
  } else if (ubicacion.pct !== null) {
    base = ubicacion.pct
  } else {
    base = 0
  }

  // --- Historial: delta acotado, solo con el mismo empresario ---
  let delta = 0
  if (historial === 'finalizada') delta = HISTORIAL_BONO_FINALIZADA
  else if (historial === 'cancelada') delta = -HISTORIAL_MALUS_CANCELADA

  const score = clamp(Math.round(base * 100 + delta), 0, 100)

  return {
    score,
    detalles,
    desglose: {
      tecnologiaPct,
      ubicacion: { estado: ubicacion.estado, pct: ubicacion.pct },
      historial: { estado: historial, delta },
    },
  }
}
