import { describe, it, expect } from 'vitest'
import {
  matchesStackSelection,
  matchesModeSelection,
  matchesBudgetRange,
  parseBudgetInput,
  type BudgetRangeFilter,
} from '@/lib/projects/marketplace-filters'

describe('matchesStackSelection', () => {
  const stack = ['react', 'tailwind', 'typescript']

  it('sin selección matchea cualquier proyecto', () => {
    expect(matchesStackSelection(stack, [], 'any')).toBe(true)
    expect(matchesStackSelection(stack, [], 'all')).toBe(true)
    expect(matchesStackSelection([], [], 'all')).toBe(true)
  })

  it('any: basta una tecnología en común', () => {
    expect(matchesStackSelection(stack, ['react', 'vue'], 'any')).toBe(true)
    expect(matchesStackSelection(stack, ['vue'], 'any')).toBe(false)
  })

  it('all: exige todas las tecnologías seleccionadas', () => {
    expect(matchesStackSelection(stack, ['react', 'tailwind'], 'all')).toBe(
      true,
    )
    expect(matchesStackSelection(stack, ['react', 'vue'], 'all')).toBe(false)
  })

  it('proyecto sin stack no matchea una selección no vacía', () => {
    expect(matchesStackSelection([], ['react'], 'any')).toBe(false)
    expect(matchesStackSelection([], ['react'], 'all')).toBe(false)
  })
})

describe('matchesModeSelection', () => {
  it('sin selección matchea cualquier modalidad', () => {
    expect(matchesModeSelection('remoto', [])).toBe(true)
  })

  it('matchea si la modalidad está entre las seleccionadas (OR)', () => {
    expect(matchesModeSelection('remoto', ['remoto', 'hibrido'])).toBe(true)
    expect(matchesModeSelection('presencial', ['remoto', 'hibrido'])).toBe(
      false,
    )
  })
})

describe('parseBudgetInput', () => {
  it('vacío o solo espacios → null', () => {
    expect(parseBudgetInput('')).toBeNull()
    expect(parseBudgetInput('   ')).toBeNull()
  })

  it('negativo o no numérico → null', () => {
    expect(parseBudgetInput('-5')).toBeNull()
    expect(parseBudgetInput('abc')).toBeNull()
  })

  it('número válido → número', () => {
    expect(parseBudgetInput('500')).toBe(500)
    expect(parseBudgetInput(' 300000 ')).toBe(300000)
  })
})

describe('matchesBudgetRange', () => {
  const noFilter: BudgetRangeFilter = { currency: 'USD', min: null, max: null }

  it('sin filtro activo matchea cualquier proyecto y moneda', () => {
    expect(matchesBudgetRange('CRC', 300000, 600000, noFilter)).toBe(true)
  })

  it('excluye proyectos de otra moneda cuando el filtro está activo', () => {
    expect(
      matchesBudgetRange('CRC', 300000, 600000, {
        currency: 'USD',
        min: 400,
        max: 800,
      }),
    ).toBe(false)
  })

  it('en la misma moneda matchea por solape de rangos', () => {
    // proyecto ₡300k-₡600k solapa el filtro ₡400k-₡500k
    expect(
      matchesBudgetRange('CRC', 300000, 600000, {
        currency: 'CRC',
        min: 400000,
        max: 500000,
      }),
    ).toBe(true)
    // proyecto $100-$300 no solapa el filtro $400-$800
    expect(
      matchesBudgetRange('USD', 100, 300, {
        currency: 'USD',
        min: 400,
        max: 800,
      }),
    ).toBe(false)
  })

  it('cota superior abierta (hasta null) no impone techo', () => {
    expect(
      matchesBudgetRange('USD', 100000, 100000, {
        currency: 'USD',
        min: 500,
        max: null,
      }),
    ).toBe(true)
  })

  it('proyecto sin cotas no matchea un filtro activo', () => {
    expect(
      matchesBudgetRange('USD', null, null, {
        currency: 'USD',
        min: 400,
        max: null,
      }),
    ).toBe(false)
  })
})
