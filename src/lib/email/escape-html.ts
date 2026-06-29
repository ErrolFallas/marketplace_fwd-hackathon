/**
 * Escapa texto que entra al HTML de un correo. Títulos, nombres y comentarios
 * son contenido generado por usuarios: sin escapar romperían el HTML o abrirían
 * una inyección. Compartido por las plantillas de correo nuevas.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
