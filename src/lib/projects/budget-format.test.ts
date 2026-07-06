import { describe, it, expect } from 'vitest'
import {
  formatMoney,
  formatBudgetLabel,
  sanitizeMoneyInput,
  formatMoneyGrouped,
} from '@/lib/projects/budget-format'

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

describe('sanitizeMoneyInput', () => {
  it('conserva un número entero tal cual', () => {
    expect(sanitizeMoneyInput('1000000')).toBe('1000000')
  })

  it('descarta letras y espacios', () => {
    expect(sanitizeMoneyInput('1 000 abc')).toBe('1000')
  })

  it('mantiene un único punto decimal y colapsa los extra', () => {
    expect(sanitizeMoneyInput('1500.5')).toBe('1500.5')
    expect(sanitizeMoneyInput('1500.5.5')).toBe('1500.55')
  })
})

describe('formatMoneyGrouped', () => {
  it('inserta separadores de miles (en-US usa coma)', () => {
    expect(formatMoneyGrouped(1000000, 'en')).toBe('1,000,000')
  })

  it('conserva todos los dígitos con cualquier locale', () => {
    expect(formatMoneyGrouped(2500000, 'es').replace(/\D/g, '')).toBe('2500000')
  })

  it('no redondea los centavos', () => {
    expect(formatMoneyGrouped(1500.5, 'en')).toBe('1,500.5')
  })
})
