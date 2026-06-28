interface AccountRejectedData {
  nombre: string
  rol: 'egresado' | 'empresario'
  motivo: string
}

/**
 * Escapa caracteres con significado en HTML. El `motivo` lo escribe el admin en
 * texto libre, así que se sanea antes de inyectarlo en el correo (evita romper
 * el markup y la inyección de HTML en el cliente de correo).
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Correo que avisa al usuario que el admin NO pudo verificar su perfil (RF-64
 * egresado / RF-17 empresa), con el motivo. El rechazo no es definitivo: el
 * equipo de FWD puede revisar de nuevo. Es-only, como el resto de los templates.
 */
export function accountRejectedHtml({
  nombre,
  rol,
  motivo,
}: AccountRejectedData): string {
  const rolLabel = rol === 'empresario' ? 'empresa' : 'egresado de FWD'
  // El reenvío tras editar datos aplica al empresario (datos editables). Para el
  // egresado el rechazo suele ser por el cotejo contra la base FWD, que editar el
  // perfil no resuelve: se le ofrece contacto, no la promesa de reenviar.
  const cierre =
    rol === 'empresario'
      ? 'Esto no es definitivo. Si actualizás los datos observados, el equipo de FWD Talent puede volver a revisar tu perfil. Si creés que se trata de un error, respondé a este correo y lo revisamos.'
      : 'Si creés que se trata de un error, respondé a este correo y el equipo de FWD Talent lo revisará.'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sobre tu verificación — FWD Talent</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#662D91;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">FWD Talent Marketplace</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:800;line-height:1.2;">
                Sobre tu verificación<span style="color:#FFCB05;">.</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
                Hola <strong>${escapeHtml(nombre)}</strong>,
              </p>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                Revisamos tu perfil de <strong>${rolLabel}</strong> y, por ahora, no pudimos completar tu verificación.
              </p>
              <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:700;line-height:1.6;">
                Motivo:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-left:4px solid #F7901E;background-color:#fff7ed;padding:14px 18px;border-radius:6px;color:#374151;font-size:15px;line-height:1.6;">
                    ${escapeHtml(motivo)}
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">
                ${cierre}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
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

export function accountRejectedSubject(): string {
  return 'Actualización sobre tu verificación en FWD Talent'
}
