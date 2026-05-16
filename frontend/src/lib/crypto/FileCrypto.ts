/**
 * @fileoverview FileCrypto - Cifrado y descifrado de archivos para el frontend.
 *
 * Utiliza AES-256-GCM para el cifrado simétrico y RSA-OAEP para el cifrado
 * de la clave simétrica. Soporta datos adicionales autenticados (AAD) y
 * verificación de integridad mediante hash SHA-256.
 */

import {
  generateRandomBytes,
  base64ToUint8Array,
  uint8ArrayToBase64,
  hashSHA256,
} from './utils';
import { KeyManager } from './KeyManager';

/**
 * Resultado de un archivo cifrado.
 */
export interface EncryptedFileResult {
  /** Archivo cifrado como ArrayBuffer. */
  encryptedFile: ArrayBuffer;
  /** Clave simétrica cifrada con la clave pública del propietario (Base64). */
  encryptedSymmetricKey: string;
  /** Hash SHA-256 del contenido original del archivo. */
  contentHash: string;
  /** Vector de inicialización (IV) utilizado en AES-GCM (Base64). */
  iv: string;
}

/**
 * Resultado de un archivo descifrado.
 */
export interface DecryptedFileResult {
  /** Datos del archivo descifrado. */
  data: ArrayBuffer;
  /** Hash SHA-256 del contenido descifrado para verificación de integridad. */
  contentHash: string;
}

/**
 * Clase encargada de cifrar y descifrar archivos mediante AES-256-GCM
 * combinado con RSA-OAEP para el intercambio seguro de claves.
 */
export class FileCrypto {
  private static readonly AES_KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits para GCM
  private static readonly TAG_LENGTH = 128; // 128 bits

  /**
   * Genera una clave AES-256 aleatoria.
   * @returns Clave criptográfica para AES-GCM.
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
   * Cifra un archivo con AES-256-GCM.
   *
   * Flujo:
   * 1. Calcula el hash SHA-256 del contenido original.
   * 2. Genera una clave simétrica AES y un IV aleatorio.
   * 3. Cifra el archivo con AES-GCM.
   * 4. Exporta la clave simétrica y la cifra con la clave pública del propietario.
   *
   * @param fileData - Datos brutos del archivo.
   * @param ownerPublicKey - Clave pública del propietario (PEM o CryptoKey).
   * @returns Resultado con el archivo cifrado, la clave simétrica cifrada, el hash y el IV.
   */
  static async encryptFile(
    fileData: ArrayBuffer,
    ownerPublicKey: string | CryptoKey
  ): Promise<EncryptedFileResult> {
    // Generar hash de contenido antes de cifrar
    const contentHash = await hashSHA256(fileData);

    // Generar clave simétrica aleatoria
    const symmetricKey = await this.generateAESKey();

    // Generar IV
    const iv = generateRandomBytes(this.IV_LENGTH);

    // Cifrar archivo con AES-GCM
    const encryptedFile = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: this.TAG_LENGTH,
      },
      symmetricKey,
      fileData
    );

    // Exportar clave simétrica
    const rawSymmetricKey = await crypto.subtle.exportKey('raw', symmetricKey);

    // Cifrar clave simétrica con la clave pública del propietario
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
   * Descifra un archivo cifrado con AES-256-GCM.
   *
   * Flujo:
   * 1. Descifra la clave simétrica con la clave privada del propietario.
   * 2. Importa la clave simétrica.
   * 3. Descifra el archivo y recalcula el hash para integridad.
   *
   * @param encryptedFile - Datos del archivo cifrado.
   * @param encryptedSymmetricKey - Clave simétrica cifrada (Base64).
   * @param privateKey - Clave privada del propietario.
   * @param iv - Vector de inicialización (Base64).
   * @param authTag - Etiqueta de autenticación opcional (Base64).
   * @returns Datos descifrados y hash de contenido.
   */
  static async decryptFile(
    encryptedFile: ArrayBuffer,
    encryptedSymmetricKey: string,
    privateKey: CryptoKey,
    iv?: string,
    authTag?: string
  ): Promise<DecryptedFileResult> {
    // Descifrar clave simétrica
    const rawSymmetricKey = await KeyManager.decryptWithPrivateKey(
      encryptedSymmetricKey,
      privateKey
    );

    // Importar clave simétrica
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

    // Descifrar archivo
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv ? base64ToUint8Array(iv) as BufferSource : new Uint8Array(12) as BufferSource,
        tagLength: this.TAG_LENGTH,
      },
      symmetricKey,
      encryptedPayload
    );

    // Calcular hash de contenido
    const contentHash = await hashSHA256(decryptedData);

    return {
      data: decryptedData,
      contentHash,
    };
  }

  /**
   * Re-cifra una clave simétrica para compartir con otro usuario.
   *
   * Flujo:
   * 1. Descifra la clave simétrica con la clave privada del propietario actual.
   * 2. Cifra la clave simétrica con la clave pública del destinatario.
   *
   * @param encryptedKey - Clave simétrica cifrada actualmente.
   * @param ownerPrivateKey - Clave privada del propietario actual.
   * @param recipientPublicKey - Clave pública del destinatario.
   * @returns Clave simétrica re-cifrada para el destinatario.
   */
  static async reEncryptSymmetricKey(
    encryptedKey: string,
    ownerPrivateKey: CryptoKey,
    recipientPublicKey: string | CryptoKey
  ): Promise<string> {
    // Descifrar con la clave privada del propietario
    const rawKey = await KeyManager.decryptWithPrivateKey(encryptedKey, ownerPrivateKey);

    // Cifrar con la clave pública del destinatario
    return await KeyManager.encryptWithPublicKey(rawKey, recipientPublicKey);
  }

  /**
   * Calcula el hash SHA-256 de los datos de un archivo.
   * @param data - Datos del archivo.
   * @returns Hash SHA-256 en formato hexadecimal.
   */
  static async hashFile(data: ArrayBuffer): Promise<string> {
    return await hashSHA256(data);
  }

  /**
   * Genera un hash de metadatos para un documento.
   *
   * Combina el nombre, tamaño y hash de contenido en una sola cadena y
   * aplica SHA-256 para obtener un identificador único de metadatos.
   *
   * @param name - Nombre del documento.
   * @param size - Tamaño del archivo en bytes.
   * @param contentHash - Hash de contenido del archivo.
   * @returns Hash combinado de metadatos.
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
   * Cifra un pequeño fragmento de datos (por ejemplo, una clave o metadatos)
   * con la clave pública proporcionada.
   * @param data - Datos a cifrar.
   * @param publicKey - Clave pública (PEM o CryptoKey).
   * @returns Datos cifrados en Base64.
   */
  static async encryptData(
    data: ArrayBuffer,
    publicKey: string | CryptoKey
  ): Promise<string> {
    return await KeyManager.encryptWithPublicKey(data, publicKey);
  }

  /**
   * Descifra un pequeño fragmento de datos con la clave privada proporcionada.
   * @param encryptedData - Datos cifrados (Base64).
   * @param privateKey - Clave privada.
   * @returns Datos descifrados como ArrayBuffer.
   */
  static async decryptData(
    encryptedData: string,
    privateKey: CryptoKey
  ): Promise<ArrayBuffer> {
    return await KeyManager.decryptWithPrivateKey(encryptedData, privateKey);
  }

  /**
   * Cifra un archivo con datos adicionales autenticados (AAD).
   *
   * Incluye metadatos en la autenticación del cifrado AES-GCM para
   * garantizar que los metadatos no han sido alterados.
   *
   * @param fileData - Datos del archivo a cifrar.
   * @param ownerPublicKey - Clave pública del propietario.
   * @param additionalData - Datos adicionales autenticados.
   * @returns Resultado del archivo cifrado con AAD.
   */
  static async encryptFileWithAAD(
    fileData: ArrayBuffer,
    ownerPublicKey: string | CryptoKey,
    additionalData: ArrayBuffer
  ): Promise<EncryptedFileResult> {
    // Generar hash de contenido antes de cifrar
    const contentHash = await hashSHA256(fileData);

    // Generar clave simétrica aleatoria
    const symmetricKey = await this.generateAESKey();

    // Generar IV
    const iv = generateRandomBytes(this.IV_LENGTH);

    // Cifrar archivo con AES-GCM y AAD
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

    // Exportar y cifrar clave simétrica
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
   * Descifra un archivo cifrado con datos adicionales autenticados (AAD).
   *
   * @param encryptedFile - Archivo cifrado.
   * @param encryptedSymmetricKey - Clave simétrica cifrada.
   * @param privateKey - Clave privada del propietario.
   * @param iv - Vector de inicialización utilizado durante el cifrado.
   * @param additionalData - Datos adicionales autenticados.
   * @returns Datos descifrados y hash de contenido.
   */
  static async decryptFileWithAAD(
    encryptedFile: ArrayBuffer,
    encryptedSymmetricKey: string,
    privateKey: CryptoKey,
    iv: string,
    additionalData: ArrayBuffer
  ): Promise<DecryptedFileResult> {
    // Descifrar clave simétrica
    const rawSymmetricKey = await KeyManager.decryptWithPrivateKey(
      encryptedSymmetricKey,
      privateKey
    );

    // Importar clave simétrica
    const symmetricKey = await crypto.subtle.importKey(
      'raw',
      rawSymmetricKey,
      { name: 'AES-GCM' },
      true,
      ['decrypt']
    );

    // Descifrar archivo con AAD
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

    // Calcular hash de contenido
    const contentHash = await hashSHA256(decryptedData);

    return {
      data: decryptedData,
      contentHash,
    };
  }

  /**
   * Verifica la integridad de un archivo comparando su hash con el esperado.
   * @param data - Datos del archivo.
   * @param expectedHash - Hash esperado.
   * @returns `true` si el hash coincide; de lo contrario, `false`.
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
