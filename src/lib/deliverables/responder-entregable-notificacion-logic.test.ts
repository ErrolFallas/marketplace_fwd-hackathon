import { describe, it, expect } from 'vitest'
import { buildEntregableRespuestaNotificacion } from './responder-entregable-notificacion-logic'

const base = {
  idUsuarioEgresado: '11111111-1111-1111-1111-111111111111',
  tituloProyecto: 'Sitio web',
  idProyecto: '22222222-2222-2222-2222-222222222222',
}

describe('buildEntregableRespuestaNotificacion', () => {
  it('aprobado no-final: tipo entregable_aprobado sin texto de finalización', () => {
    const notif = buildEntregableRespuestaNotificacion({
      ...base,
      decision: 'aprobado',
      finalizado: false,
    })
    expect(notif.tipoEvento).toBe('entregable_aprobado')
    expect(notif.mensaje).toContain('fue aprobado')
    expect(notif.mensaje).not.toContain('finalizado')
    expect(notif.params).toEqual({ titulo: 'Sitio web' })
    expect(notif.idUsuario).toBe(base.idUsuarioEgresado)
  })

  it('aprobado final: incluye que el proyecto quedó finalizado', () => {
    const notif = buildEntregableRespuestaNotificacion({
      ...base,
      decision: 'aprobado',
      finalizado: true,
    })
    expect(notif.tipoEvento).toBe('entregable_aprobado')
    expect(notif.mensaje).toContain('finalizado')
  })

  it('con_cambios: tipo entregable_rechazado con copy "solicitó cambios"', () => {
    const notif = buildEntregableRespuestaNotificacion({
      ...base,
      decision: 'con_cambios',
      finalizado: false,
    })
    expect(notif.tipoEvento).toBe('entregable_rechazado')
    expect(notif.mensaje).toContain('solicitó cambios')
    expect(notif.mensaje).not.toContain('rechaz')
  })

  it('urlDestino apunta a la vista de entregables del egresado', () => {
    const notif = buildEntregableRespuestaNotificacion({
      ...base,
      decision: 'aprobado',
      finalizado: false,
    })
    expect(notif.urlDestino).toContain(
      `/egresado/contrataciones/${base.idProyecto}`,
    )
  })
})
