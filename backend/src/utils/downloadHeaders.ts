import { Response } from 'express';
import { buildAttachmentDisposition } from './httpHeaders';

export interface DownloadResult {
  name: string;
  mimeType: string;
  encryptedSymmetricKey: string;
  encryptionIV?: string;
  encryptionAuthTag?: string;
  encryptedFile: Buffer;
}

/**
 * Establece las cabeceras HTTP adecuadas para la descarga de un documento.
 * Si el documento no esta cifrado (clave simetrica igual a `'UNENCRYPTED'`),
 * se usa el MIME original; en caso contrario se transmite como
 * `application/octet-stream` con cabeceras de cifrado adicionales.
 * @param res - Objeto de respuesta de Express.
 * @param result - Resultado de la descarga con el archivo y sus metadatos.
 */
export function setDownloadHeaders(res: Response, result: DownloadResult): void {
  const isUnencrypted = result.encryptedSymmetricKey === 'UNENCRYPTED';

  res.setHeader('Content-Type', isUnencrypted ? result.mimeType : 'application/octet-stream');
  res.setHeader('Content-Disposition', buildAttachmentDisposition(`${result.name}${isUnencrypted ? '' : '.encrypted'}`));

  if (!isUnencrypted) {
    res.setHeader('X-Encrypted-Symmetric-Key', result.encryptedSymmetricKey);
    if (result.encryptionIV) {
      res.setHeader('X-Encryption-IV', result.encryptionIV);
    }
    if (result.encryptionAuthTag) {
      res.setHeader('X-Encryption-Auth-Tag', result.encryptionAuthTag);
    }
  }

  res.setHeader('X-Is-Encrypted', isUnencrypted ? 'false' : 'true');
  res.setHeader('X-Mime-Type', result.mimeType);
}
