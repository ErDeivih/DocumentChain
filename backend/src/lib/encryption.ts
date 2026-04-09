/**
 * Server-Side Encryption Library
 * Handles AES-256-GCM encryption/decryption for files
 * Replaces client-side encryption (moved from frontend)
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

export interface EncryptionResult {
  encryptedData: Buffer;
  symmetricKey: string; // Base64 encoded
  iv: string; // Base64 encoded
  authTag: string; // Base64 encoded
  contentHash: string; // SHA-256 hash of original file
}

export interface DecryptionInput {
  encryptedData: Buffer;
  symmetricKey: string; // Base64 encoded
  iv: string; // Base64 encoded
  authTag: string; // Base64 encoded
}

/**
 * Generate a random AES-256 symmetric key
 */
export function generateSymmetricKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Encrypt file data with AES-256-GCM
 * @param fileBuffer Original file buffer
 * @param symmetricKey Optional symmetric key (generates new if not provided)
 * @returns Encryption result with encrypted data and metadata
 */
export function encryptFile(
  fileBuffer: Buffer,
  symmetricKey?: string
): EncryptionResult {
  // Generate or use provided symmetric key
  const keyString = symmetricKey || generateSymmetricKey();
  const key = Buffer.from(keyString, 'base64');

  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt data
  const encryptedChunks: Buffer[] = [];
  encryptedChunks.push(cipher.update(fileBuffer));
  encryptedChunks.push(cipher.final());
  const encryptedData = Buffer.concat(encryptedChunks);

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Calculate content hash (SHA-256 of original file)
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
 * Decrypt file data with AES-256-GCM
 * @param input Decryption parameters
 * @returns Decrypted file buffer
 */
export function decryptFile(input: DecryptionInput): Buffer {
  const {
    encryptedData,
    symmetricKey: symmetricKeyB64,
    iv: ivB64,
    authTag: authTagB64,
  } = input;

  // Decode base64 values
  const key = Buffer.from(symmetricKeyB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt data
  const decryptedChunks: Buffer[] = [];
  decryptedChunks.push(decipher.update(encryptedData));
  decryptedChunks.push(decipher.final());

  return Buffer.concat(decryptedChunks);
}

/**
 * Encrypt symmetric key with user's RSA public key
 * @param symmetricKey Base64-encoded symmetric key
 * @param publicKeyPem User's RSA public key in PEM format
 * @returns Base64-encoded encrypted symmetric key
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
 * Decrypt symmetric key with user's RSA private key
 * @param encryptedSymmetricKey Base64-encoded encrypted symmetric key
 * @param privateKeyPem User's RSA private key in PEM format
 * @returns Base64-encoded symmetric key
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
 * Validate file size
 * @param fileSize File size in bytes
 * @param maxSizeMB Maximum allowed size in MB (default: 100MB)
 * @throws Error if file is too large
 */
export function validateFileSize(fileSize: number, maxSizeMB: number = 100): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
}

/**
 * Validate MIME type against whitelist
 * @param mimeType File MIME type
 * @param allowedTypes Optional array of allowed MIME types (null = allow all)
 * @throws Error if MIME type not allowed
 */
export function validateMimeType(
  mimeType: string,
  allowedTypes: string[] | null = null
): void {
  // If no whitelist provided, allow all types
  if (!allowedTypes || allowedTypes.length === 0) {
    return;
  }

  // Check if MIME type is in whitelist
  const isAllowed = allowedTypes.some(allowed => {
    // Support wildcards like "image/*"
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
 * Calculate SHA-256 hash of buffer
 * @param buffer Data buffer
 * @returns Hex-encoded hash
 */
export function calculateHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
