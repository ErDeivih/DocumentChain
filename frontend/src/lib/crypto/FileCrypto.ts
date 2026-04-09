/**
 * FileCrypto - File Encryption/Decryption for Frontend
 * Uses AES-256-GCM for symmetric encryption and RSA-OAEP for key encryption
 */

import {
  generateRandomBytes,
  base64ToUint8Array,
  uint8ArrayToBase64,
  hashSHA256,
} from './utils';
import { KeyManager } from './KeyManager';

export interface EncryptedFileResult {
  encryptedFile: ArrayBuffer;
  encryptedSymmetricKey: string;
  contentHash: string;
  iv: string;
}

export interface DecryptedFileResult {
  data: ArrayBuffer;
  contentHash: string;
}

/**
 * FileCrypto class for file encryption operations
 */
export class FileCrypto {
  private static readonly AES_KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 128; // 128 bits

  /**
   * Generate a random AES-256 key
   * @returns CryptoKey for AES-GCM
   */
  private static async generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: this.AES_KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a file with AES-256-GCM
   * The symmetric key is encrypted with the owner's public key
   * 
   * @param fileData Raw file data
   * @param ownerPublicKey Owner's public key (PEM or CryptoKey)
   * @returns Encrypted file data, encrypted symmetric key, and content hash
   */
  static async encryptFile(
    fileData: ArrayBuffer,
    ownerPublicKey: string | CryptoKey
  ): Promise<EncryptedFileResult> {
    // Generate content hash before encryption
    const contentHash = await hashSHA256(fileData);

    // Generate random AES key
    const symmetricKey = await this.generateAESKey();

    // Generate IV
    const iv = generateRandomBytes(this.IV_LENGTH);

    // Encrypt file with AES-GCM
    const encryptedFile = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: this.TAG_LENGTH,
      },
      symmetricKey,
      fileData
    );

    // Export symmetric key
    const rawSymmetricKey = await crypto.subtle.exportKey('raw', symmetricKey);

    // Encrypt symmetric key with owner's public key
    const encryptedSymmetricKey = await KeyManager.encryptWithPublicKey(
      rawSymmetricKey,
      ownerPublicKey
    );

    return {
      encryptedFile,
      encryptedSymmetricKey,
      contentHash,
      iv: uint8ArrayToBase64(iv),
    };
  }

  /**
   * Decrypt a file with AES-256-GCM
   * 
   * @param encryptedFile Encrypted file data
   * @param encryptedSymmetricKey Encrypted symmetric key (Base64)
   * @param privateKey Owner's private key
   * @param iv IV used for encryption (Base64)
   * @returns Decrypted file data and content hash
   */
  static async decryptFile(
    encryptedFile: ArrayBuffer,
    encryptedSymmetricKey: string,
    privateKey: CryptoKey,
    iv?: string,
    authTag?: string
  ): Promise<DecryptedFileResult> {
    // Decrypt symmetric key
    const rawSymmetricKey = await KeyManager.decryptWithPrivateKey(
      encryptedSymmetricKey,
      privateKey
    );

    // Import symmetric key
    const symmetricKey = await crypto.subtle.importKey(
      'raw',
      rawSymmetricKey,
      { name: 'AES-GCM' },
      true,
      ['decrypt']
    );

    const encryptedPayload = authTag
      ? (() => {
          const ciphertext = new Uint8Array(encryptedFile);
          const authTagBytes = base64ToUint8Array(authTag);
          const combined = new Uint8Array(ciphertext.length + authTagBytes.length);
          combined.set(ciphertext, 0);
          combined.set(authTagBytes, ciphertext.length);
          return combined.buffer;
        })()
      : encryptedFile;

    // Decrypt file
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv ? base64ToUint8Array(iv) as BufferSource : new Uint8Array(12) as BufferSource,
        tagLength: this.TAG_LENGTH,
      },
      symmetricKey,
      encryptedPayload
    );

    // Calculate content hash
    const contentHash = await hashSHA256(decryptedData);

    return {
      data: decryptedData,
      contentHash,
    };
  }

  /**
   * Re-encrypt symmetric key for sharing
   * Decrypts with owner's private key and encrypts with recipient's public key
   * 
   * @param encryptedKey Encrypted symmetric key
   * @param ownerPrivateKey Owner's private key
   * @param recipientPublicKey Recipient's public key
   * @returns Re-encrypted key for recipient
   */
  static async reEncryptSymmetricKey(
    encryptedKey: string,
    ownerPrivateKey: CryptoKey,
    recipientPublicKey: string | CryptoKey
  ): Promise<string> {
    // Decrypt with owner's private key
    const rawKey = await KeyManager.decryptWithPrivateKey(encryptedKey, ownerPrivateKey);

    // Encrypt with recipient's public key
    return await KeyManager.encryptWithPublicKey(rawKey, recipientPublicKey);
  }

  /**
   * Calculate hash of file data
   * @param data File data
   * @returns SHA-256 hash
   */
  static async hashFile(data: ArrayBuffer): Promise<string> {
    return await hashSHA256(data);
  }

  /**
   * Generate metadata hash for document
   * Combines name, size, and content hash
   * 
   * @param name Document name
   * @param size File size in bytes
   * @param contentHash Content hash
   * @returns Combined hash
   */
  static async generateMetadataHash(
    name: string,
    size: number,
    contentHash: string
  ): Promise<string> {
    const metadata = `${name}:${size}:${contentHash}`;
    return await hashSHA256(metadata);
  }

  /**
   * Encrypt a small piece of data (like a key or metadata)
   * 
   * @param data Data to encrypt
   * @param publicKey Public key
   * @returns Encrypted data as Base64
   */
  static async encryptData(
    data: ArrayBuffer,
    publicKey: string | CryptoKey
  ): Promise<string> {
    return await KeyManager.encryptWithPublicKey(data, publicKey);
  }

  /**
   * Decrypt a small piece of data
   * 
   * @param encryptedData Encrypted data (Base64)
   * @param privateKey Private key
   * @returns Decrypted data
   */
  static async decryptData(
    encryptedData: string,
    privateKey: CryptoKey
  ): Promise<ArrayBuffer> {
    return await KeyManager.decryptWithPrivateKey(encryptedData, privateKey);
  }

  /**
   * Encrypt file with additional authenticated data (AAD)
   * Useful for including metadata in the authentication
   * 
   * @param fileData File data to encrypt
   * @param ownerPublicKey Owner's public key
   * @param additionalData Additional authenticated data
   * @returns Encrypted file result
   */
  static async encryptFileWithAAD(
    fileData: ArrayBuffer,
    ownerPublicKey: string | CryptoKey,
    additionalData: ArrayBuffer
  ): Promise<EncryptedFileResult> {
    // Generate content hash before encryption
    const contentHash = await hashSHA256(fileData);

    // Generate random AES key
    const symmetricKey = await this.generateAESKey();

    // Generate IV
    const iv = generateRandomBytes(this.IV_LENGTH);

    // Encrypt file with AES-GCM and AAD
    const encryptedFile = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        additionalData: additionalData,
        tagLength: this.TAG_LENGTH,
      },
      symmetricKey,
      fileData
    );

    // Export and encrypt symmetric key
    const rawSymmetricKey = await crypto.subtle.exportKey('raw', symmetricKey);
    const encryptedSymmetricKey = await KeyManager.encryptWithPublicKey(
      rawSymmetricKey,
      ownerPublicKey
    );

    return {
      encryptedFile,
      encryptedSymmetricKey,
      contentHash,
      iv: uint8ArrayToBase64(iv),
    };
  }

  /**
   * Decrypt file with additional authenticated data (AAD)
   * 
   * @param encryptedFile Encrypted file
   * @param encryptedSymmetricKey Encrypted symmetric key
   * @param privateKey Private key
   * @param iv IV used for encryption
   * @param additionalData Additional authenticated data
   * @returns Decrypted file result
   */
  static async decryptFileWithAAD(
    encryptedFile: ArrayBuffer,
    encryptedSymmetricKey: string,
    privateKey: CryptoKey,
    iv: string,
    additionalData: ArrayBuffer
  ): Promise<DecryptedFileResult> {
    // Decrypt symmetric key
    const rawSymmetricKey = await KeyManager.decryptWithPrivateKey(
      encryptedSymmetricKey,
      privateKey
    );

    // Import symmetric key
    const symmetricKey = await crypto.subtle.importKey(
      'raw',
      rawSymmetricKey,
      { name: 'AES-GCM' },
      true,
      ['decrypt']
    );

    // Decrypt file with AAD
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64ToUint8Array(iv) as BufferSource,
        additionalData: additionalData,
        tagLength: this.TAG_LENGTH,
      },
      symmetricKey,
      encryptedFile
    );

    // Calculate content hash
    const contentHash = await hashSHA256(decryptedData);

    return {
      data: decryptedData,
      contentHash,
    };
  }

  /**
   * Verify file integrity
   * 
   * @param data File data
   * @param expectedHash Expected hash
   * @returns True if hash matches
   */
  static async verifyIntegrity(
    data: ArrayBuffer,
    expectedHash: string
  ): Promise<boolean> {
    const actualHash = await this.hashFile(data);
    return actualHash === expectedHash;
  }
}

export default FileCrypto;
