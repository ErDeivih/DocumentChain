/**
 * @fileoverview KeyManager - Gestión de pares de claves RSA para el frontend.
 *
 * Proporciona operaciones para generar, cifrar, descifrar, importar y
 * re-cifrar claves privadas mediante RSA-OAEP y AES-GCM.
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

/**
 * Resultado de la generación de un par de claves RSA.
 */
export interface KeyPairResult {
  /** Clave pública en formato PEM. */
  publicKey: string;
  /** Clave privada cifrada y codificada en Base64. */
  encryptedPrivateKey: string;
  /** Sal utilizada para el cifrado de la clave privada (Base64). */
  salt: string;
}

/**
 * Par de claves descifradas como objetos CryptoKey.
 */
export interface DecryptedKeyPair {
  /** Clave pública como CryptoKey. */
  publicKey: CryptoKey;
  /** Clave privada como CryptoKey. */
  privateKey: CryptoKey;
}

/**
 * Convierte un ArrayBuffer a formato PEM.
 * @param buffer - Buffer de datos.
 * @param type - Tipo de clave (PUBLIC KEY o PRIVATE KEY).
 * @returns Cadena en formato PEM.
 */
function arrayBufferToPem(buffer: ArrayBuffer, type: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
  const base64 = arrayBufferToBase64(buffer);
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
}

/**
 * Convierte una cadena PEM a ArrayBuffer.
 * @param pem - Cadena en formato PEM.
 * @returns ArrayBuffer con los datos binarios de la clave.
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const lines = pem.split('\n');
  const base64 = lines
    .filter(line => !line.startsWith('-----'))
    .join('');
  return base64ToArrayBuffer(base64);
}

/**
 * Clase encargada de la gestión de pares de claves RSA.
 *
 * Incluye generación de claves, cifrado de clave privada con contraseña,
 * importación de claves públicas y re-cifrado de claves privadas.
 */
export class KeyManager {
  private static readonly RSA_MODULUS_LENGTH = 4096;
  private static readonly SALT_LENGTH = 16;

  /**
   * Genera un nuevo par de claves RSA.
   *
   * Flujo:
   * 1. Genera un par de claves RSA-OAEP de 4096 bits.
   * 2. Exporta la clave pública a formato SPKI/PEM.
   * 3. Exporta la clave privada a formato PKCS8.
   * 4. Deriva una clave de cifrado a partir de la contraseña y una sal aleatoria.
   * 5. Cifra la clave privada con AES-GCM.
   *
   * @param password - Contraseña para cifrar la clave privada.
   * @returns Resultado con clave pública, clave privada cifrada y sal.
   */
  static async generateKeyPair(password: string): Promise<KeyPairResult> {
    // Generar par de claves RSA
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

    // Exportar clave pública a formato SPKI
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyPem = arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY');

    // Exportar clave privada a formato PKCS8
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    // Generar sal para el cifrado
    const salt = generateRandomBytes(this.SALT_LENGTH);
    const saltBase64 = uint8ArrayToBase64(salt);

    // Derivar clave de cifrado a partir de la contraseña
    const encryptionKey = await deriveKeyFromPassword(password, salt);

    // Generar IV para AES-GCM
    const iv = generateRandomBytes(12);

    // Cifrar clave privada
    const encryptedPrivateKey = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      encryptionKey,
      privateKeyBuffer
    );

    // Combinar IV y clave cifrada
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
   * Descifra una clave privada mediante una contraseña.
   *
   * Soporta dos formatos de clave privada cifrada:
   * - Formato antiguo: IV + ciphertext combinados y codificados en Base64.
   * - Formato nuevo: sal:iv:authTag:ciphertext separados por dos puntos.
   *
   * @param encryptedPrivateKey - Clave privada cifrada en Base64.
   * @param password - Contraseña para descifrar.
   * @param salt - Sal en Base64 (requerida para el formato antiguo).
   * @returns Clave privada descifrada como CryptoKey.
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

    // Decodificar IV + clave cifrada combinados
    const combined = base64ToUint8Array(encryptedPrivateKey);
    const iv = combined.slice(0, 12);
    const encryptedKey = combined.slice(12);

    // Derivar clave de descifrado a partir de la contraseña
    const decryptionKey = await deriveKeyFromPassword(password, salt);

    // Descifrar clave privada
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      decryptionKey,
      encryptedKey
    );

    // Importar como CryptoKey
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
   * Importa una clave pública desde formato PEM.
   * @param publicKeyPem - Clave pública en formato PEM.
   * @returns Clave pública como CryptoKey.
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
   * Cifra datos con una clave pública utilizando RSA-OAEP.
   * @param data - Datos a cifrar.
   * @param publicKey - Clave pública (PEM o CryptoKey).
   * @returns Datos cifrados codificados en Base64.
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
   * Descifra datos con una clave privada utilizando RSA-OAEP.
   * @param encryptedData - Datos cifrados en Base64.
   * @param privateKey - Clave privada como CryptoKey.
   * @returns Datos descifrados como ArrayBuffer.
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
   * Genera el hash SHA-256 de una clave pública para verificación.
   * @param publicKeyPem - Clave pública en formato PEM.
   * @returns Hash SHA-256 de la clave pública.
   */
  static async getPublicKeyHash(publicKeyPem: string): Promise<string> {
    return await hashSHA256(publicKeyPem);
  }

  /**
   * Verifica que una clave pública coincida con un hash esperado.
   * @param publicKeyPem - Clave pública en formato PEM.
   * @param hash - Hash esperado.
   * @returns `true` si coincide; de lo contrario, `false`.
   */
  static async verifyPublicKeyHash(publicKeyPem: string, hash: string): Promise<boolean> {
    const computedHash = await this.getPublicKeyHash(publicKeyPem);
    return computedHash === hash;
  }

  /**
   * Re-cifra una clave privada con una nueva contraseña.
   *
   * Flujo:
   * 1. Descifra la clave privada con la contraseña antigua.
   * 2. Exporta la clave privada a formato PKCS8.
   * 3. Genera una nueva sal y deriva una nueva clave de cifrado.
   * 4. Cifra la clave privada con AES-GCM y la nueva contraseña.
   *
   * @param encryptedPrivateKey - Clave privada cifrada actual.
   * @param oldPassword - Contraseña actual.
   * @param oldSalt - Sal actual.
   * @param newPassword - Nueva contraseña.
   * @returns Objeto con la clave privada re-cifrada y la nueva sal.
   */
  static async reEncryptPrivateKey(
    encryptedPrivateKey: string,
    oldPassword: string,
    oldSalt: string,
    newPassword: string
  ): Promise<{ encryptedPrivateKey: string; salt: string }> {
    // Descifrar con la contraseña antigua
    const privateKey = await this.decryptPrivateKey(encryptedPrivateKey, oldPassword, oldSalt);

    // Exportar clave privada
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', privateKey);

    // Generar nueva sal
    const newSalt = generateRandomBytes(this.SALT_LENGTH);
    const newSaltBase64 = uint8ArrayToBase64(newSalt);

    // Derivar nueva clave de cifrado
    const newEncryptionKey = await deriveKeyFromPassword(newPassword, newSalt);

    // Generar nuevo IV
    const iv = generateRandomBytes(12);

    // Cifrar con la nueva contraseña
    const newEncryptedKey = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      newEncryptionKey,
      privateKeyBuffer
    );

    // Combinar IV y clave cifrada
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
