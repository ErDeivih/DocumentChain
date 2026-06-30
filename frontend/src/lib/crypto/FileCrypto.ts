/**
 * @fileoverview FileCrypto - Cifrado y descifrado de archivos para el frontend.
 *
 * Utiliza AES-256-GCM para el cifrado simétrico y RSA-OAEP para el cifrado
 * de la clave simétrica. Soporta verificación de integridad mediante hash SHA-256.
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
  authTag: string;
  symmetricKeyRaw: string;
}

export interface DecryptedFileResult {
  data: ArrayBuffer;
  contentHash: string;
}

export class FileCrypto {
  private static readonly AES_KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 128;

  private static async generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: FileCrypto.AES_KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptFile(
    fileData: ArrayBuffer,
    ownerPublicKey: string | CryptoKey
  ): Promise<EncryptedFileResult> {
    const contentHash = await hashSHA256(fileData);

    const symmetricKey = await FileCrypto.generateAESKey();

    const iv = generateRandomBytes(FileCrypto.IV_LENGTH);

    const encryptedFile = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: FileCrypto.TAG_LENGTH,
      },
      symmetricKey,
      fileData
    );

    const rawSymmetricKey = await crypto.subtle.exportKey('raw', symmetricKey);

    const encryptedSymmetricKey = await KeyManager.encryptWithPublicKey(
      rawSymmetricKey,
      ownerPublicKey
    );

    const symmetricKeyRaw = uint8ArrayToBase64(new Uint8Array(rawSymmetricKey));

    const encryptedBytes = new Uint8Array(encryptedFile);
    const ciphertextLen = encryptedBytes.length - 16;
    const authTag = uint8ArrayToBase64(encryptedBytes.slice(ciphertextLen));
    const encryptedFileStripped = encryptedBytes.slice(0, ciphertextLen).buffer;

    return {
      encryptedFile: encryptedFileStripped,
      encryptedSymmetricKey,
      contentHash,
      iv: uint8ArrayToBase64(iv),
      authTag,
      symmetricKeyRaw,
    };
  }

  static async encryptFileWithKey(
    fileData: ArrayBuffer,
    ownerPublicKey: string | CryptoKey,
    existingAESKey: CryptoKey
  ): Promise<EncryptedFileResult> {
    const contentHash = await hashSHA256(fileData);

    const iv = generateRandomBytes(FileCrypto.IV_LENGTH);

    const encryptedFile = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: FileCrypto.TAG_LENGTH,
      },
      existingAESKey,
      fileData
    );

    const rawKey = await crypto.subtle.exportKey('raw', existingAESKey);

    const encryptedSymmetricKey = await KeyManager.encryptWithPublicKey(
      rawKey,
      ownerPublicKey
    );

    const encryptedBytes = new Uint8Array(encryptedFile);
    const ciphertextLen = encryptedBytes.length - 16;
    const authTag = uint8ArrayToBase64(encryptedBytes.slice(ciphertextLen));
    const encryptedFileStripped = encryptedBytes.slice(0, ciphertextLen).buffer;

    return {
      encryptedFile: encryptedFileStripped,
      encryptedSymmetricKey,
      contentHash,
      iv: uint8ArrayToBase64(iv),
      authTag,
      symmetricKeyRaw: '',
    };
  }

  static async importAESKeyFromRaw(rawKey: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM', length: FileCrypto.AES_KEY_LENGTH },
      false,
      ['encrypt']
    );
  }

  static async decryptFile(
    encryptedFile: ArrayBuffer,
    encryptedSymmetricKey: string,
    privateKey: CryptoKey,
    iv?: string,
    authTag?: string
  ): Promise<DecryptedFileResult> {
    const rawSymmetricKey = await KeyManager.decryptWithPrivateKey(
      encryptedSymmetricKey,
      privateKey
    );

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

    if (!iv) {
      throw new Error('No se puede descifrar el archivo: falta el vector de inicialización');
    }

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: base64ToUint8Array(iv) as BufferSource,
        tagLength: FileCrypto.TAG_LENGTH,
      },
      symmetricKey,
      encryptedPayload
    );

    const contentHash = await hashSHA256(decryptedData);

    return {
      data: decryptedData,
      contentHash,
    };
  }
}

export default FileCrypto;
