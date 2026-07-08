'use client'

import { useReducer } from 'react'
import { CATALOGO_SUSCRIPCIONES } from '@/lib/cotizador-pert/constants'
import { MODULOS_PERT } from '@/lib/cotizador-pert/types'
import type {
  ContrasteStack,
  EstimacionIaResultado,
  FuenteOP,
  HorasPorModulo,
  Idioma,
  ModuloPert,
  RangosPropuestos,
  StackReport,
  Suscripcion,
  TipoDespliegue,
} from '@/lib/cotizador-pert/types'

/**
 * Sub-estado de la calculadora, desacoplado del react-hook-form del formulario
 * de postulación. Cualquier cambio en las HORAS invalida la propuesta IA previa
 * (anti-stale: la IA abrió O/P alrededor de la M anterior; con otra M dejan de
 * tener sentido). El dinero NO vive aquí: se deriva con calcularCotizacion.
 */
export interface CotizadorState {
  horasM: HorasPorModulo
  idioma: Idioma
  despliegueTipo: TipoDespliegue
  serverUsdMes: number
  mesesCobertura: number
  suscripciones: Suscripcion[]
  githubUrl: string
  usuarioPruebaJson: string
  propuestaIa: RangosPropuestos | null
  fuenteOP: FuenteOP
  stackReport: StackReport | null
  contraste: ContrasteStack | null
  avisos: string[]
  montoFinal: string
  montoTocado: boolean
}

const horasCero: HorasPorModulo = MODULOS_PERT.reduce((acc, m) => {
  acc[m] = 0
  return acc
}, {} as HorasPorModulo)

export const estadoInicial: CotizadorState = {
  horasM: horasCero,
  idioma: 'es',
  despliegueTipo: 'gratuito',
  serverUsdMes: 0,
  mesesCobertura: 1,
  suscripciones: CATALOGO_SUSCRIPCIONES.map((s) => ({ ...s, activa: false })),
  githubUrl: '',
  usuarioPruebaJson: '',
  propuestaIa: null,
  fuenteOP: 'fallback',
  stackReport: null,
  contraste: null,
  avisos: [],
  montoFinal: '',
  montoTocado: false,
}

// Al cambiar las horas, la propuesta IA queda obsoleta (se recae al fallback).
const IA_INVALIDA = {
  propuestaIa: null,
  fuenteOP: 'fallback' as FuenteOP,
}

export type CotizadorAccion =
  | { type: 'hora'; modulo: ModuloPert; valor: number }
  | { type: 'idioma'; valor: Idioma }
  | { type: 'despliegueTipo'; valor: TipoDespliegue }
  | { type: 'server'; valor: number }
  | { type: 'meses'; valor: number }
  | { type: 'toggleSub'; index: number }
  | { type: 'subCosto'; index: number; valor: number }
  | { type: 'githubUrl'; valor: string }
  | { type: 'usuarioPrueba'; valor: string }
  | { type: 'iaResult'; valor: EstimacionIaResultado }
  | { type: 'montoFinal'; valor: string; tocado: boolean }

export function cotizadorReducer(
  state: CotizadorState,
  accion: CotizadorAccion,
): CotizadorState {
  switch (accion.type) {
    case 'hora':
      return {
        ...state,
        horasM: { ...state.horasM, [accion.modulo]: accion.valor },
        ...IA_INVALIDA,
      }
    case 'idioma':
      return { ...state, idioma: accion.valor }
    case 'despliegueTipo':
      return { ...state, despliegueTipo: accion.valor }
    case 'server':
      return { ...state, serverUsdMes: accion.valor }
    case 'meses':
      return { ...state, mesesCobertura: accion.valor }
    case 'toggleSub':
      return {
        ...state,
        suscripciones: state.suscripciones.map((s, i) =>
          i === accion.index ? { ...s, activa: !s.activa } : s,
        ),
      }
    case 'subCosto':
      return {
        ...state,
        suscripciones: state.suscripciones.map((s, i) =>
          i === accion.index ? { ...s, costoUsdMes: accion.valor } : s,
        ),
      }
    case 'githubUrl':
      return { ...state, githubUrl: accion.valor }
    case 'usuarioPrueba':
      return { ...state, usuarioPruebaJson: accion.valor }
    case 'iaResult':
      return {
        ...state,
        propuestaIa: accion.valor.propuesta,
        fuenteOP: accion.valor.fuenteOP,
        stackReport: accion.valor.stack,
        contraste: accion.valor.contraste,
        avisos: accion.valor.avisos,
      }
    case 'montoFinal':
      return { ...state, montoFinal: accion.valor, montoTocado: accion.tocado }
    default:
      return state
  }
}

export function useCotizadorPert() {
  return useReducer(cotizadorReducer, estadoInicial)
}
