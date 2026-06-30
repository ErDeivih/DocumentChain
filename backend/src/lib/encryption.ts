/**
 * Utilidades criptográficas del lado del servidor.
 *
 * El cifrado AES-256-GCM y RSA-OAEP se realiza en el frontend.
 * Se conservan calculateHash y validateFileSize (utilidades sin clave).
 */

import crypto from 'crypto';

export function validateFileSize(fileSize: number, maxSizeMB: number = 100): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
}

export function calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
