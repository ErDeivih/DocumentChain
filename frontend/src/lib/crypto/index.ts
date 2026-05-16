/**
 * @fileoverview Módulo de criptografía del frontend.
 *
 * Este módulo centraliza toda la funcionalidad criptográfica necesaria para:
 * - Generación y gestión de pares de claves RSA.
 * - Cifrado y descifrado de archivos con AES-256-GCM.
 * - Almacenamiento seguro en memoria de claves privadas.
 * - Funciones de utilidad para hash y codificación.
 */

// Re-exportar todas las utilidades
export * from './utils';

// Re-exportar KeyManager
export { KeyManager } from './KeyManager';
export type { KeyPairResult, DecryptedKeyPair } from './KeyManager';

// Re-exportar FileCrypto
export { FileCrypto } from './FileCrypto';
export type { EncryptedFileResult, DecryptedFileResult } from './FileCrypto';

// Re-exportar SecureStorage
export { SecureStorage } from './SecureStorage';
export type { KeyCacheEntry } from './SecureStorage';

// Exportación por defecto para conveniencia
export default {
  KeyManager: (await import('./KeyManager')).KeyManager,
  FileCrypto: (await import('./FileCrypto')).FileCrypto,
  SecureStorage: (await import('./SecureStorage')).SecureStorage,
};
