import { describe, it, expect } from 'vitest'
import { normalizarTexto } from './normalizar-texto'

describe('normalizarTexto', () => {
  it('pasa a minúsculas', () => {
    expect(normalizarTexto('HOLA')).toBe('hola')
  })

  it('recorta espacios al inicio y al final', () => {
    expect(normalizarTexto('  hola  ')).toBe('hola')
  })

  it('elimina tildes y diéresis', () => {
    expect(normalizarTexto('Canción')).toBe('cancion')
    expect(normalizarTexto('pingüino')).toBe('pinguino')
  })

  it('trata la ñ como n (búsqueda tolerante)', () => {
    expect(normalizarTexto('Peña')).toBe('pena')
  })

  it('deja intacto un texto ya normalizado', () => {
    expect(normalizarTexto('proyecto')).toBe('proyecto')
  })

  it('devuelve cadena vacía para solo espacios', () => {
    expect(normalizarTexto('   ')).toBe('')
  })
})
