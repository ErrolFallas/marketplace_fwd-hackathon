import { describe, expect, it } from 'vitest'
import { firmaConversacion } from './use-polling-mensajes'
import type { Mensaje } from '@/lib/mensajes/actions'

function crearMensaje(overrides: Partial<Mensaje> = {}): Mensaje {
  return {
    idMensaje: 'm1',
    idProyecto: 'p1',
    idRemitente: 'u1',
    contenido: 'hola',
    leido: false,
    fechaEnvio: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('firmaConversacion', () => {
  it('da la misma firma para hilos equivalentes', () => {
    const a = { mensajes: [crearMensaje()], puedeEnviar: true }
    const b = { mensajes: [crearMensaje()], puedeEnviar: true }
    expect(firmaConversacion(a)).toBe(firmaConversacion(b))
  })

  it('cambia al agregar un mensaje', () => {
    const antes = { mensajes: [crearMensaje()], puedeEnviar: true }
    const despues = {
      mensajes: [crearMensaje(), crearMensaje({ idMensaje: 'm2' })],
      puedeEnviar: true,
    }
    expect(firmaConversacion(antes)).not.toBe(firmaConversacion(despues))
  })

  it('cambia cuando un mensaje pasa a leído', () => {
    const noLeido = {
      mensajes: [crearMensaje({ leido: false })],
      puedeEnviar: true,
    }
    const leido = {
      mensajes: [crearMensaje({ leido: true })],
      puedeEnviar: true,
    }
    expect(firmaConversacion(noLeido)).not.toBe(firmaConversacion(leido))
  })

  it('cambia cuando cambia el permiso de envío', () => {
    const activo = { mensajes: [crearMensaje()], puedeEnviar: true }
    const cerrado = { mensajes: [crearMensaje()], puedeEnviar: false }
    expect(firmaConversacion(activo)).not.toBe(firmaConversacion(cerrado))
  })
})
