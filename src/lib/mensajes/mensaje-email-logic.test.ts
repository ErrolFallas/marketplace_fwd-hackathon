import { describe, it, expect } from 'vitest'
import {
  shouldSendMessageEmail,
  truncarSnippet,
  SNIPPET_MAX_LEN,
} from './mensaje-email-logic'

describe('shouldSendMessageEmail', () => {
  it('manda correo si no hay avisos sin leer en el hilo', () => {
    expect(shouldSendMessageEmail({ priorUnreadCount: 0 })).toBe(true)
  })

  it('no manda correo si ya hay un aviso sin leer (throttle)', () => {
    expect(shouldSendMessageEmail({ priorUnreadCount: 1 })).toBe(false)
    expect(shouldSendMessageEmail({ priorUnreadCount: 5 })).toBe(false)
  })
})

describe('truncarSnippet', () => {
  it('deja el texto corto sin cambios (solo colapsa espacios)', () => {
    expect(truncarSnippet('Hola   mundo')).toBe('Hola mundo')
  })

  it('recorta y agrega elipsis cuando supera el máximo', () => {
    const largo = 'a'.repeat(SNIPPET_MAX_LEN + 50)
    const recorte = truncarSnippet(largo)
    expect(recorte.endsWith('…')).toBe(true)
    expect(recorte.length).toBeLessThanOrEqual(SNIPPET_MAX_LEN + 1)
  })

  it('corta en un espacio cuando hay uno razonable cerca del final', () => {
    const palabras = `${'palabra '.repeat(30)}final`.trim()
    const recorte = truncarSnippet(palabras, 50)
    expect(recorte.endsWith('…')).toBe(true)
    expect(recorte).not.toContain('  ')
  })
})
