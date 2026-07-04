import { describe, it, expect } from 'vitest'
import {
  matchesStackSelection,
  matchesModeSelection,
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
