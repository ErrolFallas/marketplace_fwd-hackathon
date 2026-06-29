import { escapeHtml } from '../escape-html'

interface EntregableAprobadoData {
  nombre: string
  tituloProyecto: string
  urlEntregables: string
  finalizado: boolean
  comentario?: string
}

/**
 * Correo al egresado cuando el empresario aprueba su entregable (RF-44 / RF-46).
 * Si `finalizado` es true, el entregable final cerró el proyecto (RF-41). es-only.
 */
export function entregableAprobadoHtml({
  nombre,
  tituloProyecto,
  urlEntregables,
  finalizado,
  comentario,
}: EntregableAprobadoData): string {
  const nombreSafe = escapeHtml(nombre)
  const tituloSafe = escapeHtml(tituloProyecto)
  const urlSafe = escapeHtml(urlEntregables)
  const cuerpo = finalizado
    ? `Tu entregable final del proyecto <strong>${tituloSafe}</strong> fue aprobado y el proyecto quedó finalizado. Ya podés calificar tu experiencia.`
    : `Tu entregable del proyecto <strong>${tituloSafe}</strong> fue aprobado.`
  const comentarioBlock = comentario
    ? `<p style="margin:0 0 24px;padding:16px;background-color:#f4f4f5;border-radius:12px;color:#374151;font-size:14px;line-height:1.6;">${escapeHtml(comentario)}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Entregable aprobado — FWD Talent</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background-color:#662D91;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">FWD Talent Marketplace</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:800;line-height:1.2;">
                Entregable aprobado<span style="color:#FFCB05;">.</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
                Hola <strong>${nombreSafe}</strong>,
              </p>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                ${cuerpo}
              </p>
              ${comentarioBlock}
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:50px;background-color:#0A6CB9;">
                    <a href="${urlSafe}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:50px;">
                      Ver los entregables
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Recibís este correo porque tenés un proyecto en desarrollo en FWD Talent.
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">
                &copy; 2026 FWD Talent. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function entregableAprobadoSubject(tituloProyecto: string): string {
  return `Tu entregable de "${tituloProyecto}" fue aprobado`
}
