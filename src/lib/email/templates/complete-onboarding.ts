interface CompleteOnboardingData {
  nombre: string
  onboardingUrl: string
}

/**
 * Correo que invita a un usuario de OAuth (Google) a completar su onboarding.
 * OAuth no exige código de verificación, así que el usuario puede saltarse la
 * pantalla de perfil; este enlace lo autentica (magic link, patrón del admin) y
 * lo devuelve a /onboarding para terminar y quedar verificable por el admin.
 *
 * Excepción documentada a reglas.md §3.2/§8 (hex inline en correos): los clientes
 * de correo no soportan variables CSS ni oklch de forma fiable, así que el HTML
 * usa hex. Los de marca son los tokens FWD exactos (#0A6CB9 primary, #662D91
 * secondary, #FFCB05 highlight); el resto son neutros propios del correo.
 */
export function completeOnboardingHtml({
  nombre,
  onboardingUrl,
}: CompleteOnboardingData): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Completá tu registro — FWD Talent</title>
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
                Ya casi estás<span style="color:#FFCB05;">.</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.6;">
                Hola <strong>${nombre}</strong>,
              </p>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                Entraste con tu cuenta de Google, pero todavía falta completar tu perfil para verificar tu cuenta.
              </p>
              <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.6;">
                Usá el botón para volver y terminar el registro. El enlace ya te identifica, no necesitás escribir nada.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:50px;background-color:#0A6CB9;">
                    <a href="${onboardingUrl}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:50px;">
                      Completar mi perfil
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">
                Si no fuiste vos, podés ignorar este correo. El enlace vence en una hora.
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

export function completeOnboardingSubject(): string {
  return 'Completá tu registro en FWD Talent'
}
