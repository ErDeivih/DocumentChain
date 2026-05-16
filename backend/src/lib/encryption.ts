/**
 * Biblioteca de cifrado del lado del servidor.
 * Gestiona el cifrado y descifrado de archivos mediante AES-256-GCM.
 * Reemplaza el cifrado del lado del cliente (trasladado desde el frontend).
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Resultado del cifrado de un archivo.
 */
export interface EncryptionResult {
  encryptedData: Buffer;
  symmetricKey: string; // Codificada en base64
  iv: string; // Codificada en base64
  authTag: string; // Codificada en base64
  contentHash: string; // Hash SHA-256 del archivo original
}

/**
 * Parámetros necesarios para descifrar un archivo.
 */
export interface DecryptionInput {
  encryptedData: Buffer;
  symmetricKey: string; // Codificada en base64
  iv: string; // Codificada en base64
  authTag: string; // Codificada en base64
}

/**
 * Genera una clave simétrica aleatoria de 256 bits para AES.
 * @returns Clave simétrica codificada en base64.
 */
export function generateSymmetricKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Cifra los datos de un archivo con AES-256-GCM.
 * @param fileBuffer - Buffer del archivo original.
 * @param symmetricKey - Clave simétrica opcional en base64; si no se proporciona, se genera una nueva.
 * @returns Resultado del cifrado con los datos cifrados y metadatos asociados.
 */
export function encryptFile(
  fileBuffer: Buffer,
  symmetricKey?: string
): EncryptionResult {
  // Generar o utilizar la clave simétrica proporcionada
  const keyString = symmetricKey || generateSymmetricKey();
  const key = Buffer.from(keyString, 'base64');

  // Generar vector de inicialización aleatorio
  const iv = crypto.randomBytes(IV_LENGTH);

  // Crear cifrador
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Cifrar datos
  const encryptedChunks: Buffer[] = [];
  encryptedChunks.push(cipher.update(fileBuffer));
  encryptedChunks.push(cipher.final());
  const encryptedData = Buffer.concat(encryptedChunks);

  // Obtener etiqueta de autenticación
  const authTag = cipher.getAuthTag();

  // Calcular hash de contenido (SHA-256 del archivo original)
  const contentHash = crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex');

  return {
    encryptedData,
    symmetricKey: keyString,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    contentHash,
  };
}

/**
 * Descifra los datos de un archivo previamente cifrados con AES-256-GCM.
 * @param input - Parámetros de descifrado.
 * @returns Buffer con los datos del archivo descifrados.
 */
export function decryptFile(input: DecryptionInput): Buffer {
  const {
    encryptedData,
    symmetricKey: symmetricKeyB64,
    iv: ivB64,
    authTag: authTagB64,
  } = input;

  // Decodificar valores en base64
  const key = Buffer.from(symmetricKeyB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  // Crear descifrador
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Descifrar datos
  const decryptedChunks: Buffer[] = [];
  decryptedChunks.push(decipher.update(encryptedData));
  decryptedChunks.push(decipher.final());

  return Buffer.concat(decryptedChunks);
}

/**
 * Cifra una clave simétrica con la clave pública RSA de un usuario.
 * @param symmetricKey - Clave simétrica codificada en base64.
 * @param publicKeyPem - Clave pública RSA del usuario en formato PEM.
 * @returns Clave simétrica cifrada y codificada en base64.
 */
export function encryptSymmetricKey(
  symmetricKey: string,
  publicKeyPem: string
): string {
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(symmetricKey, 'base64')
  );

  return encrypted.toString('base64');
}

/**
 * Descifra una clave simétrica con la clave privada RSA de un usuario.
 * @param encryptedSymmetricKey - Clave simétrica cifrada codificada en base64.
 * @param privateKeyPem - Clave privada RSA del usuario en formato PEM.
 * @returns Clave simétrica descifrada codificada en base64.
 */
export function decryptSymmetricKey(
  encryptedSymmetricKey: string,
  privateKeyPem: string
): string {
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encryptedSymmetricKey, 'base64')
  );

  return decrypted.toString('base64');
}

/**
 * Valida que el tamaño de un archivo no exceda el límite permitido.
 * @param fileSize - Tamaño del archivo en bytes.
 * @param maxSizeMB - Tamaño máximo permitido en MB (por defecto: 100 MB).
 * @throws Error si el archivo supera el tamaño máximo.
 */
export function validateFileSize(fileSize: number, maxSizeMB: number = 100): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
}

/**
 * Valida un tipo MIME contra una lista blanca de tipos permitidos.
 * @param mimeType - Tipo MIME del archivo.
 * @param allowedTypes - Lista opcional de tipos MIME permitidos (`null` permite todos).
 * @throws Error si el tipo MIME no está permitido.
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[] | null = null
): void {
  // Si no se proporciona lista blanca, permitir todos los tipos
  if (!allowedTypes || allowedTypes.length === 0) {
    return;
  }

  // Verificar si el tipo MIME está en la lista blanca
  const isAllowed = allowedTypes.some(allowed => {
    // Soporte de comodines como "image/*"
    if (allowed.endsWith('/*')) {
      const prefix = allowed.slice(0, -2);
      return mimeType.startsWith(prefix + '/');
    }
    return mimeType === allowed;
  });

  if (!isAllowed) {
    throw new Error(`File type ${mimeType} is not allowed`);
  }
}

/**
 * Calcula el hash SHA-256 de un buffer.
 * @param buffer - Buffer de datos.
 * @returns Hash codificado en hexadecimal.
 */
export function calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
