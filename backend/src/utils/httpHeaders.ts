/**
 * Sanea un nombre de archivo para cabeceras HTTP eliminando saltos de linea,
 * comillas, separadores de ruta y espacios en blanco.
 * Si el resultado esta vacio, devuelve `'document'`.
 * @param filename - Nombre de archivo a sanear.
 * @returns Nombre de archivo seguro.
 */
function sanitizeFilename(filename: string): string {
  const firstLine = filename.split(/[\r\n]/)[0] || '';
  const cleaned = firstLine
    .replace(/"/g, '')
    .replace(/[\\/]/g, '_')
    .trim();

  return cleaned || 'document';
}

/**
 * Construye una cabecera `Content-Disposition` (attachment o inline) con
 * variantes del nombre en ASCII y UTF-8.
 * @param filename - Nombre de archivo a incluir en la cabecera.
 * @param inline - Si es `true`, usa `inline` en lugar de `attachment`.
 * @returns Valor formateado de la cabecera.
 */
export function buildAttachmentDisposition(filename: string, inline = false): string {
  const safeName = sanitizeFilename(filename);
  const encoded = encodeURIComponent(safeName).replace(/['()]/g, escape);
  return `${inline ? 'inline' : 'attachment'}; filename="${safeName}"; filename*=UTF-8''${encoded}`;
}
