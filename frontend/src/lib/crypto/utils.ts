/**
 * @fileoverview Utilidades criptográficas para el frontend.
 *
 * Proporciona funciones auxiliares basadas en la Web Crypto API para
 * generación de bytes aleatorios, conversiones Base64, hash SHA-256/512,
 * derivación de claves mediante PBKDF2 y manipulación de ArrayBuffers.
 */

/**
 * Genera un array de bytes aleatorios criptográficamente seguros.
 * @param length - Número de bytes a generar.
 * @returns Uint8Array con bytes aleatorios.
 */
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convierte un ArrayBuffer a una cadena Base64.
 * @param buffer - ArrayBuffer a convertir.
 * @returns Cadena codificada en Base64.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convierte una cadena Base64 a ArrayBuffer.
 * @param base64 - Cadena codificada en Base64.
 * @returns ArrayBuffer resultante.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

/**
 * Convierte un Uint8Array a una cadena Base64.
 * @param bytes - Uint8Array a convertir.
 * @returns Cadena codificada en Base64.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convierte una cadena Base64 a Uint8Array.
 * @param base64 - Cadena codificada en Base64.
 * @returns Uint8Array resultante.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Calcula el hash SHA-256 del contenido usando la Web Crypto API.
 * @param data - Datos a hashear.
 * @returns Hash en formato hexadecimal.
 */
export async function hashSHA256(data: string | ArrayBuffer): Promise<string> {
  const buffer = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : new Uint8Array(data);

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as BufferSource);
  const hashArray = new Uint8Array(hashBuffer);

  // Convertir a cadena hexadecimal
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Deriva una clave criptográfica a partir de una contraseña mediante PBKDF2.
 * @param password - Contraseña del usuario.
 * @param salt - Sal para la derivación (Uint8Array o cadena Base64).
 * @param iterations - Número de iteraciones (predeterminado: 600000).
 * @returns Clave criptográfica derivada (AES-GCM 256 bits).
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array | string,
  iterations: number = 600000
): Promise<CryptoKey> {
  // Convertir sal si es cadena
  const saltBytes = typeof salt === 'string' ? base64ToUint8Array(salt) : salt;

  // Importar contraseña como clave raw
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derivar clave mediante PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}


