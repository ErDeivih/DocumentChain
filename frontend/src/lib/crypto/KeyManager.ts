/**
 * KeyManager - RSA Key Pair Management for Frontend
 * Handles generation, encryption, and decryption of RSA key pairs
 */

import {
  generateRandomBytes,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  base64ToUint8Array,
  uint8ArrayToBase64,
  deriveKeyFromPassword,
  hashSHA256,
} from './utils';

export interface KeyPairResult {
  publicKey: string;           // PEM format
  encryptedPrivateKey: string; // Base64 encoded encrypted key
  salt: string;                // Base64 encoded salt
}

export interface DecryptedKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

/**
 * Convert ArrayBuffer to PEM format
 */
function arrayBufferToPem(buffer: ArrayBuffer, type: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
  const base64 = arrayBufferToBase64(buffer);
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
}

/**
 * Convert PEM to ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const lines = pem.split('\n');
  const base64 = lines
    .filter(line => !line.startsWith('-----'))
    .join('');
  return base64ToArrayBuffer(base64);
}

/**
 * KeyManager class for RSA key operations
 */
export class KeyManager {
  private static readonly RSA_MODULUS_LENGTH = 4096;
  private static readonly SALT_LENGTH = 16;

  /**
   * Generate a new RSA key pair
   * @param password Password to encrypt the private key
   * @returns KeyPairResult with public key, encrypted private key, and salt
   */
  static async generateKeyPair(password: string): Promise<KeyPairResult> {
    // Generate RSA key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: this.RSA_MODULUS_LENGTH,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export public key to SPKI format
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyPem = arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY');

    // Export private key to PKCS8 format
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    // Generate salt for encryption
    const salt = generateRandomBytes(this.SALT_LENGTH);
    const saltBase64 = uint8ArrayToBase64(salt);

    // Derive encryption key from password
    const encryptionKey = await deriveKeyFromPassword(password, salt);

    // Generate IV for AES-GCM
    const iv = generateRandomBytes(12);

    // Encrypt private key
    const encryptedPrivateKey = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      encryptionKey,
      privateKeyBuffer
    );

    // Combine IV and encrypted key
    const combined = new Uint8Array(iv.length + encryptedPrivateKey.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedPrivateKey), iv.length);

    const encryptedPrivateKeyBase64 = uint8ArrayToBase64(combined);

    return {
      publicKey: publicKeyPem,
      encryptedPrivateKey: encryptedPrivateKeyBase64,
      salt: saltBase64,
    };
  }

  /**
   * Decrypt a private key with password
   * @param encryptedPrivateKey Base64 encoded encrypted private key
   * @param password Password to decrypt
   * @param salt Base64 encoded salt
   * @returns Decrypted CryptoKey
   */
  static async decryptPrivateKey(
    encryptedPrivateKey: string,
    password: string,
    salt?: string
  ): Promise<CryptoKey> {
    if (encryptedPrivateKey.includes(':')) {
      const parts = encryptedPrivateKey.split(':');

      if (parts.length !== 4) {
        throw new Error('Formato de clave privada cifrada inválido');
      }

      const [saltB64, ivB64, authTagB64, encryptedDataB64] = parts;
      const iv = base64ToUint8Array(ivB64);
      const authTag = base64ToUint8Array(authTagB64);
      const encryptedData = base64ToUint8Array(encryptedDataB64);

      const ciphertextWithTag = new Uint8Array(encryptedData.length + authTag.length);
      ciphertextWithTag.set(encryptedData, 0);
      ciphertextWithTag.set(authTag, encryptedData.length);

      const decryptionKey = await deriveKeyFromPassword(password, saltB64);
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource,
          tagLength: 128,
        },
        decryptionKey,
        ciphertextWithTag
      );

      const decryptedPem = new TextDecoder().decode(decryptedBuffer);
      const privateKeyBuffer = pemToArrayBuffer(decryptedPem);

      return await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['decrypt']
      );
    }

    if (!salt) {
      throw new Error('Falta la sal para descifrar la clave privada');
    }

    // Decode the combined IV + encrypted key
    const combined = base64ToUint8Array(encryptedPrivateKey);
    const iv = combined.slice(0, 12);
    const encryptedKey = combined.slice(12);

    // Derive decryption key from password
    const decryptionKey = await deriveKeyFromPassword(password, salt);

    // Decrypt private key
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      decryptionKey,
      encryptedKey
    );

    // Import as CryptoKey
    return await crypto.subtle.importKey(
      'pkcs8',
      decryptedBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );
  }

  /**
   * Import a public key from PEM format
   * @param publicKeyPem PEM formatted public key
   * @returns CryptoKey
   */
  static async importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
    const publicKeyBuffer = pemToArrayBuffer(publicKeyPem);
    
    return await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  }

  /**
   * Encrypt data with a public key
   * @param data Data to encrypt
   * @param publicKey Public key (PEM or CryptoKey)
   * @returns Encrypted data as Base64
   */
  static async encryptWithPublicKey(
    data: ArrayBuffer,
    publicKey: string | CryptoKey
  ): Promise<string> {
    const key = typeof publicKey === 'string' 
      ? await this.importPublicKey(publicKey) 
      : publicKey;

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      key,
      data
    );

    return arrayBufferToBase64(encrypted);
  }

  /**
   * Decrypt data with a private key
   * @param encryptedData Base64 encoded encrypted data
   * @param privateKey Private key (CryptoKey)
   * @returns Decrypted data as ArrayBuffer
   */
  static async decryptWithPrivateKey(
    encryptedData: string,
    privateKey: CryptoKey
  ): Promise<ArrayBuffer> {
    const encrypted = base64ToArrayBuffer(encryptedData);
    
    return await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encrypted
    );
  }

  /**
   * Generate a hash of the public key for verification
   * @param publicKeyPem PEM formatted public key
   * @returns SHA-256 hash of the public key
   */
  static async getPublicKeyHash(publicKeyPem: string): Promise<string> {
    return await hashSHA256(publicKeyPem);
  }

  /**
   * Verify that a public key matches a hash
   * @param publicKeyPem PEM formatted public key
   * @param hash Expected hash
   * @returns True if matches
   */
  static async verifyPublicKeyHash(publicKeyPem: string, hash: string): Promise<boolean> {
    const computedHash = await this.getPublicKeyHash(publicKeyPem);
    return computedHash === hash;
  }

  /**
   * Re-encrypt private key with a new password
   * @param encryptedPrivateKey Current encrypted private key
   * @param oldPassword Current password
   * @param oldSalt Current salt
   * @param newPassword New password
   * @returns New KeyPairResult with re-encrypted private key
   */
  static async reEncryptPrivateKey(
    encryptedPrivateKey: string,
    oldPassword: string,
    oldSalt: string,
    newPassword: string
  ): Promise<{ encryptedPrivateKey: string; salt: string }> {
    // Decrypt with old password
    const privateKey = await this.decryptPrivateKey(encryptedPrivateKey, oldPassword, oldSalt);

    // Export private key
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', privateKey);

    // Generate new salt
    const newSalt = generateRandomBytes(this.SALT_LENGTH);
    const newSaltBase64 = uint8ArrayToBase64(newSalt);

    // Derive new encryption key
    const newEncryptionKey = await deriveKeyFromPassword(newPassword, newSalt);

    // Generate new IV
    const iv = generateRandomBytes(12);

    // Encrypt with new password
    const newEncryptedKey = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      newEncryptionKey,
      privateKeyBuffer
    );

    // Combine IV and encrypted key
    const combined = new Uint8Array(iv.length + newEncryptedKey.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(newEncryptedKey), iv.length);

    return {
      encryptedPrivateKey: uint8ArrayToBase64(combined),
      salt: newSaltBase64,
    };
  }
}

export default KeyManager;
