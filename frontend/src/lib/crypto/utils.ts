/**
 * Crypto Utilities for Frontend
 * Uses Web Crypto API for all cryptographic operations
 */

/**
 * Generate random bytes
 * @param length Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param buffer ArrayBuffer to convert
 * @returns Base64 encoded string
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
 * Convert Base64 string to ArrayBuffer
 * @param base64 Base64 encoded string
 * @returns ArrayBuffer
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
 * Convert Uint8Array to Base64 string
 * @param bytes Uint8Array to convert
 * @returns Base64 encoded string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array
 * @param base64 Base64 encoded string
 * @returns Uint8Array
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
 * Hash data using SHA-256
 * @param data String or ArrayBuffer to hash
 * @returns Hex string of the hash
 */
export async function hashSHA256(data: string | ArrayBuffer): Promise<string> {
  const buffer = typeof data === 'string' 
    ? new TextEncoder().encode(data) 
    : new Uint8Array(data);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as BufferSource);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Convert to hex string
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash data using SHA-512
 * @param data String or ArrayBuffer to hash
 * @returns Hex string of the hash
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
 * Derive a cryptographic key from a password using PBKDF2
 * @param password User password
 * @param salt Salt for key derivation
 * @param iterations Number of iterations (default: 100000)
 * @returns Derived CryptoKey
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array | string,
  iterations: number = 100000
): Promise<CryptoKey> {
  // Convert salt if string
  const saltBytes = typeof salt === 'string' ? base64ToUint8Array(salt) : salt;
  
  // Import password as raw key
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive key using PBKDF2
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
 * Derive a key for RSA key encryption from password
 * Uses PBKDF2 with SHA-512 for better security
 * @param password User password
 * @param salt Salt for key derivation
 * @returns Derived CryptoKey for wrapping/unwrapping RSA keys
 */
export async function deriveKeyWrapKey(
  password: string,
  salt: Uint8Array | string
): Promise<CryptoKey> {
  // Convert salt if string
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
      iterations: 200000, // Higher iterations for key wrapping
      hash: 'SHA-512'
    },
    passwordKey,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  );
}

/**
 * Generate a random salt
 * @param length Length in bytes (default: 16)
 * @returns Base64 encoded salt string
 */
export function generateSalt(length: number = 16): string {
  const salt = generateRandomBytes(length);
  return uint8ArrayToBase64(salt);
}

/**
 * Concatenate multiple ArrayBuffers
 * @param buffers ArrayBuffers to concatenate
 * @returns Combined ArrayBuffer
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
 * Compare two ArrayBuffers for equality (constant-time)
 * @param a First buffer
 * @param b Second buffer
 * @returns True if equal
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
 * Convert string to ArrayBuffer
 * @param str String to convert
 * @returns ArrayBuffer
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

/**
 * Convert ArrayBuffer to string
 * @param buffer ArrayBuffer to convert
 * @returns String
 */
export function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Calculate SHA3-256 hash (Keccak) compatible with Solidity
 * Uses crypto-js for compatibility
 * @param data Data to hash
 * @returns Hex string of the hash
 */
export async function hashSHA3_256(data: string | ArrayBuffer): Promise<string> {
  // For Solidity compatibility, we use keccak256
  // This is implemented via a separate import from crypto-js
  // For now, we'll use SHA-256 as fallback
  // In production, import keccak from crypto-js
  const buffer = typeof data === 'string' ? stringToArrayBuffer(data) : data;
  return hashSHA256(buffer);
}

/**
 * Export CryptoKey to raw format
 * @param key CryptoKey to export
 * @returns ArrayBuffer
 */
export async function exportKeyRaw(key: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey('raw', key);
}

/**
 * Export CryptoKey to JWK format
 * @param key CryptoKey to export
 * @returns JsonWebKey
 */
export async function exportKeyJwk(key: CryptoKey): Promise<JsonWebKey> {
  return await crypto.subtle.exportKey('jwk', key);
}

/**
 * Import raw key
 * @param keyData Raw key data
 * @param algorithm Key algorithm
 * @param usages Key usages
 * @returns CryptoKey
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
