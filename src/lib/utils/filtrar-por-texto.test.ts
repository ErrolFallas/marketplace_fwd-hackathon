import { describe, it, expect } from 'vitest'
import { filtrarPorTexto } from './filtrar-por-texto'

interface Fila {
  titulo: string
}

const base: Fila[] = [
  { titulo: 'App de inventario' },
  { titulo: 'Gestión de cartas' },
  { titulo: 'Portal de reseñas' },
]

describe('filtrarPorTexto', () => {
  it('sin búsqueda devuelve todo', () => {
    expect(filtrarPorTexto(base, '', (f) => f.titulo)).toHaveLength(3)
  })

  it('solo espacios devuelve todo', () => {
    expect(filtrarPorTexto(base, '   ', (f) => f.titulo)).toHaveLength(3)
  })

  it('coincide por subcadena sin importar mayúsculas', () => {
    const resultado = filtrarPorTexto(base, 'PORTAL', (f) => f.titulo)
    expect(resultado.map((f) => f.titulo)).toEqual(['Portal de reseñas'])
  })

  it('coincide ignorando acentos', () => {
    const resultado = filtrarPorTexto(base, 'gestion', (f) => f.titulo)
    expect(resultado.map((f) => f.titulo)).toEqual(['Gestión de cartas'])
  })

  it('sin coincidencias devuelve lista vacía', () => {
    expect(filtrarPorTexto(base, 'zzz', (f) => f.titulo)).toEqual([])
  })

  it('no muta el arreglo de entrada', () => {
    const copia = [...base]
    filtrarPorTexto(base, 'app', (f) => f.titulo)
    expect(base).toEqual(copia)
  })
})
