import { describe, it, expect } from 'vitest'
import { extractHostname } from './url'

describe('extractHostname', () => {
  it('extrae el hostname de una URL absoluta', () => {
    expect(extractHostname('https://perronstore.com/tienda')).toBe(
      'perronstore.com',
    )
  })

  it('quita el prefijo www.', () => {
    expect(extractHostname('https://www.github.com/user/repo')).toBe(
      'github.com',
    )
  })

  it('conserva subdominios que no son www', () => {
    expect(extractHostname('https://app.vercel.com/dashboard')).toBe(
      'app.vercel.com',
    )
  })

  it('funciona con http', () => {
    expect(extractHostname('http://example.org')).toBe('example.org')
  })

  it('devuelve null cuando la cadena no es una URL absoluta', () => {
    expect(extractHostname('no-soy-una-url')).toBeNull()
  })

  it('devuelve null para una cadena vacía', () => {
    expect(extractHostname('')).toBeNull()
  })
})
