import { describe, it, expect } from 'vitest'
import { formatMoney, formatBudgetLabel } from '@/lib/projects/budget-format'

describe('formatMoney', () => {
  it('incluye el monto y no agrega centavos', () => {
    const out = formatMoney(500, 'USD', 'en')
    expect(out).toContain('500')
    expect(out).not.toMatch(/[.,]\d{2}\b/)
  })

  it('formatea colones (no asume dólares)', () => {
    expect(formatMoney(300000, 'CRC', 'es')).toContain('300')
  })
})

describe('formatBudgetLabel', () => {
  const texts = {
    from: (amount: string) => `Desde ${amount}`,
    to: (amount: string) => `Hasta ${amount}`,
    fallback: 'Sin dato',
  }

  it('rango completo usa un guion entre montos', () => {
    expect(formatBudgetLabel(500, 800, 'USD', 'en', texts)).toContain('–')
  })

  it('solo mínimo usa la plantilla "Desde"', () => {
    expect(formatBudgetLabel(500, null, 'USD', 'en', texts)).toMatch(/^Desde /)
  })

  it('solo máximo usa la plantilla "Hasta"', () => {
    expect(formatBudgetLabel(null, 800, 'USD', 'en', texts)).toMatch(/^Hasta /)
  })

  it('sin cotas usa el fallback', () => {
    expect(formatBudgetLabel(null, null, 'USD', 'en', texts)).toBe('Sin dato')
  })
})
