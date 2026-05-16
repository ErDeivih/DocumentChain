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
 * Calcula el hash SHA-256 de un conjunto de datos.
 * @param data - Cadena de texto o ArrayBuffer a hashear.
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
 * Calcula el hash SHA-512 de un conjunto de datos.
 * @param data - Cadena de texto o ArrayBuffer a hashear.
 * @returns Hash en formato hexadecimal.
 */
export async function hashSHA512(data: string | ArrayBuffer): Promise<string> {
  const buffer = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : new Uint8Array(data);

  const hashBuffer = await crypto.subtle.digest('SHA-512', buffer as BufferSource);
  const hashArray = new Uint8Array(hashBuffer);

  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Deriva una clave criptográfica a partir de una contraseña mediante PBKDF2.
 * @param password - Contraseña del usuario.
 * @param salt - Sal para la derivación (Uint8Array o cadena Base64).
 * @param iterations - Número de iteraciones (predeterminado: 100000).
 * @returns Clave criptográfica derivada (AES-GCM 256 bits).
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array | string,
  iterations: number = 100000
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

/**
 * Deriva una clave para el cifrado de claves RSA a partir de una contraseña.
 *
 * Utiliza PBKDF2 con SHA-512 y un mayor número de iteraciones para
 * proporcionar mayor seguridad en el envoltorio de claves.
 *
 * @param password - Contraseña del usuario.
 * @param salt - Sal para la derivación (Uint8Array o cadena Base64).
 * @returns Clave criptográfica derivada para envoltorio/ desenvoltorio de claves RSA (AES-KW 256 bits).
 */
export async function deriveKeyWrapKey(
  password: string,
  salt: Uint8Array | string
): Promise<CryptoKey> {
  // Convertir sal si es cadena
  const saltBytes = typeof salt === 'string' ? base64ToUint8Array(salt) : salt;

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations: 200000, // Mayor número de iteraciones para envoltorio de claves
      hash: 'SHA-512'
    },
    passwordKey,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  );
}

/**
 * Genera una sal aleatoria.
 * @param length - Longitud en bytes (predeterminado: 16).
 * @returns Cadena de sal codificada en Base64.
 */
export function generateSalt(length: number = 16): string {
  const salt = generateRandomBytes(length);
  return uint8ArrayToBase64(salt);
}

/**
 * Concatena múltiples ArrayBuffers en uno solo.
 * @param buffers - ArrayBuffers a concatenar.
 * @returns ArrayBuffer combinado.
 */
export function concatArrayBuffers(...buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return result.buffer as ArrayBuffer;
}

/**
 * Compara dos ArrayBuffers de forma constante (resistente a ataques de temporización).
 * @param a - Primer buffer.
 * @param b - Segundo buffer.
 * @returns `true` si son iguales; de lo contrario, `false`.
 */
export function compareArrayBuffers(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const arrA = new Uint8Array(a);
  const arrB = new Uint8Array(b);

  if (arrA.length !== arrB.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < arrA.length; i++) {
    result |= arrA[i] ^ arrB[i];
  }

  return result === 0;
}

/**
 * Convierte una cadena de texto a ArrayBuffer.
 * @param str - Cadena a convertir.
 * @returns ArrayBuffer con la representación UTF-8 de la cadena.
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

/**
 * Convierte un ArrayBuffer a cadena de texto.
 * @param buffer - ArrayBuffer a convertir.
 * @returns Cadena de texto decodificada.
 */
export function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Genera un UUID versión 4.
 * @returns Cadena UUID v4.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Calcula el hash SHA3-256 (Keccak) compatible con Solidity.
 *
 * Nota: Actualmente utiliza SHA-256 como respaldo. En producción,
 * se recomienda importar keccak256 de crypto-js para compatibilidad total.
 *
 * @param data - Datos a hashear.
 * @returns Hash en formato hexadecimal.
 */
export async function hashSHA3_256(data: string | ArrayBuffer): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  const { keccak256 } = await import('ethers');
  return keccak256(buffer);
}

/**
 * Exporta una CryptoKey a formato raw.
 * @param key - CryptoKey a exportar.
 * @returns ArrayBuffer con los datos raw de la clave.
 */
export async function exportKeyRaw(key: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey('raw', key);
}

/**
 * Exporta una CryptoKey a formato JWK (JSON Web Key).
 * @param key - CryptoKey a exportar.
 * @returns Objeto JsonWebKey.
 */
export async function exportKeyJwk(key: CryptoKey): Promise<JsonWebKey> {
  return await crypto.subtle.exportKey('jwk', key);
}

/**
 * Importa una clave en formato raw.
 * @param keyData - Datos raw de la clave.
 * @param algorithm - Algoritmo de la clave.
 * @param usages - Usos permitidos de la clave.
 * @returns CryptoKey importada.
 */
export async function importRawKey(
  keyData: ArrayBuffer,
  algorithm: string,
  usages: KeyUsage[]
): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: algorithm },
    true,
    usages
  );
}
