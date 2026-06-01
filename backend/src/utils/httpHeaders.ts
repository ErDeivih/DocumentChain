function sanitizeFilename(filename: string): string {
  const firstLine = filename.split(/[\r\n]/)[0] || '';
  const cleaned = firstLine
    .replace(/"/g, '')
    .replace(/[\\/]/g, '_')
    .trim();

  return cleaned || 'document';
}

export function buildAttachmentDisposition(filename: string, inline = false): string {
  const safeName = sanitizeFilename(filename);
  const encoded = encodeURIComponent(safeName).replace(/['()]/g, escape);
  return `${inline ? 'inline' : 'attachment'}; filename="${safeName}"; filename*=UTF-8''${encoded}`;
}
