import { escapeHtml } from '../escape-html'

interface EntregableEnviadoData {
  nombre: string
  tituloProyecto: string
  urlEntregables: string
}

/**
 * Correo al empresario cuando el egresado sube un entregable a su proyecto
 * (RF-40 / RF-41 / RF-46). es-only, mismo layout de marca FWD.
 */
export function entregableEnviadoHtml({
  nombre,
  tituloProyecto,
  urlEntregables,
}: EntregableEnviadoData): string {
  const nombreSafe = escapeHtml(nombre)
  const tituloSafe = escapeHtml(tituloProyecto)
  const urlSafe = escapeHtml(urlEntregables)

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo entregable — FWD Talent</title>
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
                Nuevo entregable<span style="color:#FFCB05;">.</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
                Hola <strong>${nombreSafe}</strong>,
              </p>
              <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.6;">
                El egresado subió un entregable para tu proyecto
                <strong>${tituloSafe}</strong>. Entrá para revisarlo y aprobarlo
                o pedir cambios.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:50px;background-color:#0A6CB9;">
                    <a href="${urlSafe}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:50px;">
                      Ver el entregable
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

export function entregableEnviadoSubject(tituloProyecto: string): string {
  return `Nuevo entregable en "${tituloProyecto}"`
}
