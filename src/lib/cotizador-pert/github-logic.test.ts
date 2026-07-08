import { describe, it, expect } from 'vitest'
import {
  parseRepoUrl,
  extraerDependencias,
  contrastarStack,
  normalizarNombre,
  construirDetectadas,
} from './github-logic'

describe('parseRepoUrl — anti-SSRF, solo github.com', () => {
  it('acepta URLs válidas de github.com', () => {
    expect(parseRepoUrl('https://github.com/vercel/next.js')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    })
    expect(parseRepoUrl('https://www.github.com/facebook/react/')).toEqual({
      owner: 'facebook',
      repo: 'react',
    })
    expect(parseRepoUrl('https://github.com/o/r.git')).toEqual({
      owner: 'o',
      repo: 'r',
    })
  })

  it('rechaza hosts que no son github.com y URLs degeneradas (SSRF)', () => {
    for (const u of [
      'https://github.com.attacker.com/a/b',
      'https://raw.githubusercontent.com/a/b',
      'http://localhost/a/b',
      'https://gitlab.com/a/b',
      'https://github.com/solo-owner',
      'https://github.com/a/b/c',
      'not a url',
      '',
    ]) {
      expect(parseRepoUrl(u)).toBeNull()
    }
  })
})

describe('extraerDependencias', () => {
  it('junta dependencies + devDependencies', () => {
    const raw = JSON.stringify({
      dependencies: { next: '15', react: '19' },
      devDependencies: { vitest: '4' },
    })
    expect(extraerDependencias(raw).sort()).toEqual(['next', 'react', 'vitest'])
  })

  it('package.json inválido o sin deps ⇒ []', () => {
    expect(extraerDependencias('{ not json')).toEqual([])
    expect(extraerDependencias(JSON.stringify({ name: 'x' }))).toEqual([])
  })
})

describe('normalizarNombre', () => {
  it('quita ruido no alfanumérico y baja a minúsculas', () => {
    expect(normalizarNombre('Next.js')).toBe('nextjs')
    expect(normalizarNombre('@supabase/supabase-js')).toBe('supabasesupabasejs')
  })
})

describe('contrastarStack — match laxo por nombre, sin versiones', () => {
  it('marca coincidencias y faltantes', () => {
    const detectadas = construirDetectadas(
      ['TypeScript'],
      ['next', 'react', '@supabase/supabase-js'],
    )
    const r = contrastarStack(detectadas, ['Next.js', 'Supabase', 'PostgreSQL'])
    expect(r.coinciden).toContain('Next.js') // ~ next
    expect(r.coinciden).toContain('Supabase') // ~ @supabase/supabase-js
    expect(r.faltantes).toContain('PostgreSQL')
  })

  it('sin requeridas ⇒ nada que contrastar', () => {
    const r = contrastarStack(['react'], [])
    expect(r.coinciden).toEqual([])
    expect(r.faltantes).toEqual([])
  })
})
