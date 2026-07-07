import { describe, it, expect } from 'vitest'
import { buildInvitacionProyectoNotificacion } from './invitacion-notificacion-logic'
import { validateNotificacionInputs } from '@/lib/notifications/create-logic'

const ID_USUARIO = '11111111-1111-4111-8111-111111111111'
const ID_PROYECTO = '22222222-2222-4222-8222-222222222222'

describe('buildInvitacionProyectoNotificacion', () => {
  const notif = buildInvitacionProyectoNotificacion({
    idUsuario: ID_USUARIO,
    tituloProyecto: 'Portal de inmuebles',
    idProyecto: ID_PROYECTO,
  })

  it('usa el tipo de evento de invitación', () => {
    expect(notif.tipoEvento).toBe('invitacion_proyecto')
  })

  it('redirige al detalle público del proyecto para el egresado', () => {
    expect(notif.urlDestino).toContain(`/egresado/projects/${ID_PROYECTO}`)
  })

  it('guarda titulo e idProyecto en params (idempotencia + i18n)', () => {
    expect(notif.params).toEqual({
      titulo: 'Portal de inmuebles',
      idProyecto: ID_PROYECTO,
    })
  })

  it('el mensaje fallback es corto y no interpola el título (tope 255)', () => {
    expect(notif.mensaje.length).toBeLessThanOrEqual(255)
    expect(notif.mensaje).not.toContain('Portal de inmuebles')
  })

  it('pasa la validación de la frontera de notificaciones', () => {
    const result = validateNotificacionInputs([notif])
    expect(result.ok).toBe(true)
  })

  it('sigue siendo válida con un título largo (no revienta 255)', () => {
    const largo = buildInvitacionProyectoNotificacion({
      idUsuario: ID_USUARIO,
      tituloProyecto: 'X'.repeat(400),
      idProyecto: ID_PROYECTO,
    })
    expect(validateNotificacionInputs([largo]).ok).toBe(true)
  })
})
