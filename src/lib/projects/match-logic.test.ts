import { describe, it, expect } from 'vitest'
import {
  calculateMatchScore,
  normalizeGeo,
  type MatchInput,
  type MatchStudentSkill,
  type MatchProjectTech,
} from './match-logic'

const TECH_A = '11111111-1111-1111-1111-111111111111'
const TECH_B = '22222222-2222-2222-2222-222222222222'

function makeInput(overrides: Partial<MatchInput> = {}): MatchInput {
  return {
    studentSkills: [],
    projectTechs: [],
    modalidad: 'remoto',
    projectLocation: { paisIso: null, region: null },
    studentLocation: { paisIso: null, region: null },
    historial: 'ninguno',
    ...overrides,
  }
}

const twoTechs: MatchProjectTech[] = [
  { id_tecnologia: TECH_A, nombre_tecnologia: 'React' },
  { id_tecnologia: TECH_B, nombre_tecnologia: 'Node' },
]
const bothAvanzado: MatchStudentSkill[] = [
  { id_tecnologia: TECH_A, nivel: 'avanzado' },
  { id_tecnologia: TECH_B, nivel: 'avanzado' },
]

describe('calculateMatchScore — tecnología', () => {
  it('dominio total en proyecto remoto da 100', () => {
    const { score } = calculateMatchScore(
      makeInput({ projectTechs: twoTechs, studentSkills: bothAvanzado }),
    )
    expect(score).toBe(100)
  })

  it('mitad de las tecnologías (remoto) da 50', () => {
    const { score, detalles } = calculateMatchScore(
      makeInput({
        projectTechs: twoTechs,
        studentSkills: [{ id_tecnologia: TECH_A, nivel: 'avanzado' }],
      }),
    )
    expect(score).toBe(50)
    expect(detalles).toHaveLength(1)
  })

  it('proyecto sin tecnologías no produce NaN y da 0', () => {
    const { score } = calculateMatchScore(
      makeInput({ projectTechs: [], studentSkills: bothAvanzado }),
    )
    expect(Number.isNaN(score)).toBe(false)
    expect(score).toBe(0)
  })
})

describe('calculateMatchScore — ubicación', () => {
  const base = {
    projectTechs: twoTechs,
    studentSkills: bothAvanzado,
    modalidad: 'presencial' as const,
  }

  it('región exacta suma el máximo (100)', () => {
    const { score, desglose } = calculateMatchScore(
      makeInput({
        ...base,
        projectLocation: { paisIso: 'CR', region: 'San José' },
        studentLocation: { paisIso: 'cr', region: 'san jose' },
      }),
    )
    expect(desglose.ubicacion.estado).toBe('region_exacta')
    expect(score).toBe(100)
  })

  it('mismo país, región distinta → 0.65 + 0.35*0.5 = 83', () => {
    const { score, desglose } = calculateMatchScore(
      makeInput({
        ...base,
        projectLocation: { paisIso: 'CR', region: 'Cartago' },
        studentLocation: { paisIso: 'CR', region: 'San José' },
      }),
    )
    expect(desglose.ubicacion.estado).toBe('mismo_pais')
    expect(score).toBe(83)
  })

  it('país distinto → solo tecnología (65), sin excluir', () => {
    const { score, desglose } = calculateMatchScore(
      makeInput({
        ...base,
        projectLocation: { paisIso: 'CR', region: 'San José' },
        studentLocation: { paisIso: 'MX', region: 'CDMX' },
      }),
    )
    expect(desglose.ubicacion.estado).toBe('distinto')
    expect(score).toBe(65)
  })

  it('egresado sin ubicación no se penaliza: renormaliza a tecnología (100)', () => {
    const { score, desglose } = calculateMatchScore(
      makeInput({
        ...base,
        projectLocation: { paisIso: 'CR', region: 'San José' },
        studentLocation: { paisIso: null, region: null },
      }),
    )
    expect(desglose.ubicacion.estado).toBe('sin_dato')
    expect(desglose.ubicacion.pct).toBeNull()
    expect(score).toBe(100)
  })

  it('remoto ignora la ubicación aunque haya datos', () => {
    const { desglose } = calculateMatchScore(
      makeInput({
        projectTechs: twoTechs,
        studentSkills: bothAvanzado,
        modalidad: 'remoto',
        projectLocation: { paisIso: 'CR', region: 'San José' },
        studentLocation: { paisIso: 'CR', region: 'San José' },
      }),
    )
    expect(desglose.ubicacion.estado).toBe('no_aplica')
  })
})

describe('calculateMatchScore — historial (mismo empresario)', () => {
  it('contrato finalizado suma 10', () => {
    const { score } = calculateMatchScore(
      makeInput({
        projectTechs: twoTechs,
        studentSkills: [{ id_tecnologia: TECH_A, nivel: 'avanzado' }],
        historial: 'finalizada',
      }),
    )
    expect(score).toBe(60) // 50 base + 10
  })

  it('contrato cancelado resta 10', () => {
    const { score } = calculateMatchScore(
      makeInput({
        projectTechs: twoTechs,
        studentSkills: [{ id_tecnologia: TECH_A, nivel: 'avanzado' }],
        historial: 'cancelada',
      }),
    )
    expect(score).toBe(40) // 50 base - 10
  })

  it('cancelado no baja de 0 (clamp)', () => {
    const { score } = calculateMatchScore(
      makeInput({
        projectTechs: twoTechs,
        studentSkills: [{ id_tecnologia: TECH_A, nivel: 'basico' }], // 10/40 = 25
        historial: 'cancelada',
      }),
    )
    expect(score).toBe(15) // 25 - 10
  })

  it('finalizado no supera 100 (clamp)', () => {
    const { score } = calculateMatchScore(
      makeInput({
        projectTechs: twoTechs,
        studentSkills: bothAvanzado,
        historial: 'finalizada',
      }),
    )
    expect(score).toBe(100) // 100 + 10 → 100
  })
})

describe('calculateMatchScore — determinismo', () => {
  it('la misma entrada produce siempre el mismo score', () => {
    const input = makeInput({
      projectTechs: twoTechs,
      studentSkills: bothAvanzado,
      modalidad: 'hibrido',
      projectLocation: { paisIso: 'CR', region: 'San José' },
      studentLocation: { paisIso: 'CR', region: 'Alajuela' },
      historial: 'finalizada',
    })
    const a = calculateMatchScore(input)
    const b = calculateMatchScore(input)
    expect(a).toEqual(b)
  })
})

describe('normalizeGeo', () => {
  it('iguala acentos y mayúsculas', () => {
    expect(normalizeGeo('San José')).toBe(normalizeGeo('san jose'))
  })
  it('trata null como cadena vacía', () => {
    expect(normalizeGeo(null)).toBe('')
  })
})
