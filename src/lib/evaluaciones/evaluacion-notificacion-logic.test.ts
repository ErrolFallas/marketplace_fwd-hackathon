import { describe, it, expect } from 'vitest'
import { buildEvaluacionRecibidaNotificacion } from './evaluacion-notificacion-logic'
import { DEFAULT_LOCALE } from '@/i18n/config'

describe('buildEvaluacionRecibidaNotificacion', () => {
  it('notifica al egresado apuntando a su perfil', () => {
    const notif = buildEvaluacionRecibidaNotificacion({
      idUsuario: 'usr-egresado',
      tituloProyecto: 'App de ventas',
      destino: 'egresado',
    })

    expect(notif.idUsuario).toBe('usr-egresado')
    expect(notif.tipoEvento).toBe('evaluacion_recibida')
    expect(notif.urlDestino).toBe(`/${DEFAULT_LOCALE}/egresado/perfil`)
    expect(notif.params).toEqual({ titulo: 'App de ventas' })
    expect(notif.mensaje).toContain('App de ventas')
  })

  it('notifica a la empresa apuntando a su perfil', () => {
    const notif = buildEvaluacionRecibidaNotificacion({
      idUsuario: 'usr-empresa',
      tituloProyecto: 'Sitio corporativo',
      destino: 'empresa',
    })

    expect(notif.idUsuario).toBe('usr-empresa')
    expect(notif.tipoEvento).toBe('evaluacion_recibida')
    expect(notif.urlDestino).toBe(`/${DEFAULT_LOCALE}/empresario/perfil`)
    expect(notif.params).toEqual({ titulo: 'Sitio corporativo' })
  })

  it('incluye el título del proyecto en el mensaje de fallback', () => {
    const notif = buildEvaluacionRecibidaNotificacion({
      idUsuario: 'usr-1',
      tituloProyecto: 'Proyecto X',
      destino: 'egresado',
    })

    expect(notif.mensaje).toBe(
      'Recibiste una nueva calificación en el proyecto "Proyecto X".',
    )
  })
})
