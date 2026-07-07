import { describe, it, expect } from 'vitest'
import { buildContratacionFinalizadaNotificacion } from './contratacion-finalizada-notificacion-logic'
import { DEFAULT_LOCALE } from '@/i18n/config'

describe('buildContratacionFinalizadaNotificacion', () => {
  it('arma la notificación al egresado con tipo, url y params', () => {
    const notif = buildContratacionFinalizadaNotificacion({
      idUsuarioEgresado: 'usr-egresado',
      tituloProyecto: 'App de ventas',
      idProyecto: 'proj-1',
    })

    expect(notif.idUsuario).toBe('usr-egresado')
    expect(notif.tipoEvento).toBe('contratacion_finalizada')
    expect(notif.urlDestino).toBe(
      `/${DEFAULT_LOCALE}/egresado/contrataciones/proj-1`,
    )
    expect(notif.params).toEqual({ titulo: 'App de ventas' })
  })

  it('incluye el título del proyecto en el mensaje de fallback', () => {
    const notif = buildContratacionFinalizadaNotificacion({
      idUsuarioEgresado: 'usr-1',
      tituloProyecto: 'Proyecto X',
      idProyecto: 'proj-2',
    })

    expect(notif.mensaje).toBe(
      'El proyecto "Proyecto X" se finalizó. Ya podés calificar a la empresa.',
    )
  })
})
