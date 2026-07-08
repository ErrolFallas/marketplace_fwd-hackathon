import { MODULOS_PERT } from '../types'
import type { CotizacionResultado, ModuloPert } from '../types'

/**
 * Genera el PDF de desglose de la cotización con pdf-lib (import dinámico para no
 * inflar el bundle del formulario). El texto humano llega ya traducido en
 * `textos` (el módulo no depende de next-intl). Las fuentes estándar de pdf-lib
 * usan WinAnsi: NO codifican ₡ ni ≈, así que los montos van como "CRC/USD" y todo
 * lo dibujado pasa por un sanitizador que descarta caracteres no representables.
 */

export interface CotizacionPdfTextos {
  titulo: string
  subtitulo: string
  montoLabel: string
  escenariosTitulo: string
  optimista: string
  masProbable: string
  esperado: string
  pesimista: string
  colModulo: string
  colHorasM: string
  colBetaH: string
  colCosto: string
  totalLabel: string
  notasTitulo: string
  githubLabel: string
  prototipoLabel: string
  usuarioPruebaLabel: string
  noVinculante: string
  moduloLabels: Record<ModuloPert, string>
}

export interface CotizacionPdfDatos {
  resultado: CotizacionResultado
  montoCrc: number
  tcRef: number
  githubUrl: string
  prototipoUrl: string
  usuarioPruebaJson: string
  textos: CotizacionPdfTextos
}

/** Deja solo caracteres que WinAnsi puede codificar (evita que drawText lance). */
function winAnsi(s: string): string {
  return s
    .replace(/₡/g, 'CRC ')
    .replace(/≈/g, '~')
    .replace(/[^\x20-\xFF]/g, '') // fuera de Latin-1 imprimible
    .replace(/[\x80-\x9F]/g, '') // controles C1
}

const fmt = (n: number): string => Math.round(n).toLocaleString('en-US')
const crc = (n: number): string => `CRC ${fmt(n)}`
const usd = (n: number): string => `USD ${fmt(n)}`

/** Trocea una cadena larga (JSON/URL sin espacios) para que quepa por ancho. */
function trocear(s: string, size = 95): string[] {
  const out: string[] = []
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size))
  return out.length ? out : ['']
}

export async function generarCotizacionPdf(
  datos: CotizacionPdfDatos,
): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const { resultado, montoCrc, tcRef, textos } = datos
  const { escenarios } = resultado

  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // A4
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const M = 50
  const negro = rgb(0.11, 0.11, 0.13)
  const gris = rgb(0.42, 0.42, 0.47)
  const primario = rgb(0.15, 0.32, 0.75)
  let y = 800

  const texto = (
    s: string,
    opts: {
      size?: number
      f?: typeof font
      color?: typeof negro
      x?: number
      gap?: number
    } = {},
  ) => {
    const { size = 10, f = font, color = negro, x = M, gap = 15 } = opts
    page.drawText(winAnsi(s), { x, y, size, font: f, color })
    y -= gap
  }

  const fila = (
    cols: { s: string; x: number; f?: typeof font }[],
    gap = 14,
  ) => {
    for (const c of cols) {
      page.drawText(winAnsi(c.s), {
        x: c.x,
        y,
        size: 9,
        font: c.f ?? font,
        color: negro,
      })
    }
    y -= gap
  }

  // Encabezado
  texto(textos.titulo, { size: 18, f: bold, gap: 20 })
  texto(textos.subtitulo, { size: 9, color: gris, gap: 22 })

  // Monto cotizado (lo que verá el empresario)
  texto(textos.montoLabel, { size: 9, color: gris, gap: 15 })
  texto(`${crc(montoCrc)}   (${usd(montoCrc / tcRef)})`, {
    size: 20,
    f: bold,
    color: primario,
    gap: 26,
  })

  // Escenarios O/M/P/Beta
  texto(textos.escenariosTitulo, { size: 11, f: bold, gap: 16 })
  const esc: [string, number, number][] = [
    [
      textos.optimista,
      escenarios.optimista.totalCrc,
      escenarios.optimista.totalUsd,
    ],
    [
      textos.masProbable,
      escenarios.masProbable.totalCrc,
      escenarios.masProbable.totalUsd,
    ],
    [
      textos.esperado,
      escenarios.esperado.totalCrc,
      escenarios.esperado.totalUsd,
    ],
    [
      textos.pesimista,
      escenarios.pesimista.totalCrc,
      escenarios.pesimista.totalUsd,
    ],
  ]
  for (const [label, cCrc, cUsd] of esc) {
    fila([
      { s: label, x: M },
      { s: crc(cCrc), x: 220 },
      { s: usd(cUsd), x: 360 },
    ])
  }
  y -= 8

  // Tabla por módulo (escenario esperado / Beta)
  fila(
    [
      { s: textos.colModulo, x: M, f: bold },
      { s: textos.colHorasM, x: 250, f: bold },
      { s: textos.colBetaH, x: 340, f: bold },
      { s: textos.colCosto, x: 430, f: bold },
    ],
    16,
  )
  for (const m of MODULOS_PERT) {
    fila([
      { s: textos.moduloLabels[m], x: M },
      { s: `${escenarios.masProbable.horasPorModulo[m]} h`, x: 250 },
      { s: `${escenarios.esperado.horasPorModulo[m].toFixed(1)} h`, x: 340 },
      { s: crc(escenarios.esperado.costoPorModulo[m]), x: 430 },
    ])
  }
  y -= 4
  fila(
    [
      { s: textos.totalLabel, x: M, f: bold },
      { s: crc(escenarios.esperado.totalCrc), x: 430, f: bold },
    ],
    24,
  )

  // Notas para el empresario
  texto(textos.notasTitulo, { size: 11, f: bold, gap: 16 })
  const nota = (label: string, valor: string) => {
    if (!valor.trim()) return
    texto(label, { size: 9, f: bold, color: gris, gap: 13 })
    for (const linea of trocear(valor.trim())) {
      texto(linea, { size: 9, gap: 12 })
    }
    y -= 4
  }
  nota(textos.githubLabel, datos.githubUrl)
  nota(textos.prototipoLabel, datos.prototipoUrl)
  nota(textos.usuarioPruebaLabel, datos.usuarioPruebaJson)

  // Pie
  y = Math.max(y, 50)
  page.drawText(winAnsi(textos.noVinculante), {
    x: M,
    y: 40,
    size: 8,
    font,
    color: gris,
  })

  const bytes = await doc.save()
  // pdf-lib devuelve Uint8Array<ArrayBufferLike>; Blob lo acepta en runtime, pero
  // el tipo BlobPart de TS 5.7 no lo reconoce sin ayuda.
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
}
