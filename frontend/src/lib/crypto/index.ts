/**
 * Crypto Module - Frontend Cryptographic Operations
 * 
 * This module provides all cryptographic functionality needed for:
 * - RSA key pair generation and management
 * - File encryption/decryption with AES-256-GCM
 * - Secure in-memory storage for private keys
 * - Utility functions for hashing and encoding
 */

// Re-export all utilities
export * from './utils';

// Re-export KeyManager
export { KeyManager } from './KeyManager';
export type { KeyPairResult, DecryptedKeyPair } from './KeyManager';

// Re-export FileCrypto
export { FileCrypto } from './FileCrypto';
export type { EncryptedFileResult, DecryptedFileResult } from './FileCrypto';

// Re-export SecureStorage
export { SecureStorage } from './SecureStorage';
export type { KeyCacheEntry } from './SecureStorage';

// Default export for convenience
export default {
  KeyManager: (await import('./KeyManager')).KeyManager,
  FileCrypto: (await import('./FileCrypto')).FileCrypto,
  SecureStorage: (await import('./SecureStorage')).SecureStorage,
};
