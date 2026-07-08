import { describe, it, expect } from 'vitest'
import { esHostBloqueado, validarUrlPrototipo } from './link-safety-logic'

describe('esHostBloqueado', () => {
  it('bloquea localhost y variantes internas', () => {
    for (const host of [
      'localhost',
      'api.localhost',
      'servicio.local',
      'db.internal',
      '',
    ]) {
      expect(esHostBloqueado(host)).toBe(true)
    }
  })

  it('bloquea IPv4 privadas, loopback y metadata', () => {
    for (const ip of [
      '127.0.0.1',
      '10.1.2.3',
      '192.168.0.1',
      '172.16.0.1',
      '172.31.255.255',
      '169.254.169.254',
      '0.0.0.0',
      '100.64.0.1',
    ]) {
      expect(esHostBloqueado(ip)).toBe(true)
    }
  })

  it('bloquea IPv6 loopback, link-local y ULA', () => {
    for (const ip of ['::1', 'fe80::1', 'fc00::1', 'fd12:3456::1']) {
      expect(esHostBloqueado(ip)).toBe(true)
    }
  })

  it('permite hosts públicos', () => {
    for (const host of [
      'example.com',
      'mi-proto.vercel.app',
      'demo.netlify.app',
      '8.8.8.8',
      '172.32.0.1',
    ]) {
      expect(esHostBloqueado(host)).toBe(false)
    }
  })
})

describe('validarUrlPrototipo', () => {
  it('acepta https a host público', () => {
    const r = validarUrlPrototipo('https://mi-proto.vercel.app/demo')
    expect(r.ok).toBe(true)
  })

  it('rechaza esquema no https', () => {
    const r = validarUrlPrototipo('http://example.com')
    expect(r).toEqual({ ok: false, motivo: 'esquema_no_https' })
  })

  it('rechaza esquemas peligrosos', () => {
    const r = validarUrlPrototipo('javascript:alert(1)')
    expect(r.ok).toBe(false)
  })

  it('rechaza host interno aunque sea https', () => {
    expect(validarUrlPrototipo('https://localhost:3000')).toEqual({
      ok: false,
      motivo: 'host_privado',
    })
    expect(validarUrlPrototipo('https://169.254.169.254/latest')).toEqual({
      ok: false,
      motivo: 'host_privado',
    })
  })

  it('rechaza URL malformada', () => {
    expect(validarUrlPrototipo('no es una url')).toEqual({
      ok: false,
      motivo: 'url_malformada',
    })
  })
})
