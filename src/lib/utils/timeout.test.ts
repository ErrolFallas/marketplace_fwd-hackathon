import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withTimeout } from './timeout'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('withTimeout', () => {
  it('resuelve con el valor de la promesa si resuelve antes del límite', async () => {
    const result = withTimeout(Promise.resolve('ok'), 1_000)
    await vi.advanceTimersByTimeAsync(0)
    expect(await result).toBe('ok')
  })

  it('rechaza con el error original si la promesa rechaza antes del límite', async () => {
    // Rechazo diferido (no Promise.reject de una): así withTimeout ya
    // engancha su .then antes de que el rechazo ocurra, sin la ventana de
    // "unhandled rejection" que Node marca entre crear y enganchar la promesa.
    let rejectFn: (error: Error) => void = () => {}
    const pending = new Promise<string>((_, reject) => {
      rejectFn = reject
    })
    const result = withTimeout(pending, 1_000)
    rejectFn(new Error('boom'))
    await expect(result).rejects.toThrow('boom')
  })

  it('rechaza con upload_timeout si la promesa no resuelve a tiempo', async () => {
    const neverResolves = new Promise(() => {})
    const result = withTimeout(neverResolves, 1_000)
    const assertion = expect(result).rejects.toThrow('upload_timeout')
    await vi.advanceTimersByTimeAsync(1_000)
    await assertion
  })

  it('no rechaza por timeout si la promesa ya resolvió antes', async () => {
    const result = withTimeout(Promise.resolve('rápido'), 1_000)
    const value = await result
    await vi.advanceTimersByTimeAsync(1_000)
    expect(value).toBe('rápido')
  })
})
