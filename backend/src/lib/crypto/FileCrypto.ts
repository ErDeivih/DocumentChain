import crypto from 'crypto';
import { KeyManager } from './KeyManager';

/**
 * Gestiona el cifrado y descifrado de archivos mediante AES-256-GCM.
 * Las claves simétricas se generan por archivo y se cifran con la clave pública del usuario.
 */
export class FileCrypto {
  /**
   * Genera una clave simétrica aleatoria de 256 bits para AES.
   * @returns Clave de 256 bits como Buffer.
   */
  static generateSymmetricKey(): Buffer {
    return crypto.randomBytes(32); // 256 bits
  }

  /**
   * Cifra los datos de un archivo con AES-256-GCM.
   * @param fileData - Datos del archivo a cifrar.
   * @param symmetricKey - Clave simétrica de 256 bits.
   * @returns Cadena con los datos cifrados en formato `iv:authTag:encryptedData` (base64).
   * @throws Error si la longitud de la clave no es de 32 bytes.
   */
  static encryptFile(fileData: Buffer, symmetricKey: Buffer): string {
    if (symmetricKey.length !== 32) {
      throw new Error('La clave simétrica debe ser de 256 bits (32 bytes)');
    }

    const iv = crypto.randomBytes(12); // IV de 96 bits para GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(fileData),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Formato de salida: iv:authTag:encryptedData (todo en base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  /**
   * Descifra datos de archivo previamente cifrados con {@link encryptFile}.
   * @param encryptedData - Datos cifrados en formato `iv:authTag:encryptedData`.
   * @param symmetricKey - Clave simétrica de 256 bits utilizada durante el cifrado.
   * @returns Datos del archivo descifrados como Buffer.
   * @throws Error si el formato es inválido o la clave no coincide.
   */
  static decryptFile(encryptedData: string, symmetricKey: Buffer): Buffer {
    if (symmetricKey.length !== 32) {
      throw new Error('La clave simétrica debe ser de 256 bits (32 bytes)');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de datos de archivo encriptado inválido');
    }

    const [ivB64, authTagB64, dataB64] = parts;

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
    decipher.setAuthTag(authTag);

    try {
      return Buffer.concat([
        decipher.update(data),
        decipher.final()
      ]);
    } catch (error) {
      throw new Error('Error al desencriptar archivo - clave inválida o datos corruptos');
    }
  }

  /**
   * Cifra un archivo y prepara la clave simétrica cifrada para el propietario.
   * Genera una clave simétrica, cifra el archivo y cifra dicha clave con la clave pública del propietario.
   * @param fileData - Datos del archivo a cifrar.
   * @param ownerPublicKey - Clave pública del propietario en formato PEM.
   * @param ownerPrivateKey - Clave privada del propietario en formato PEM.
   * @returns Objeto con el archivo cifrado, la clave simétrica cifrada y la clave simétrica en claro.
   */
  static encryptFileForOwner(
    fileData: Buffer,
    ownerPublicKey: string,
    ownerPrivateKey: string
  ): {
    encryptedFile: string;
    encryptedSymmetricKey: string;
    symmetricKey: Buffer;
  } {
    // Generar clave simétrica
    const symmetricKey = this.generateSymmetricKey();

    // Cifrar archivo
    const encryptedFile = this.encryptFile(fileData, symmetricKey);

    // Cifrar clave simétrica con la clave pública del propietario
    const encryptedSymmetricKey = KeyManager.encryptForRecipient(
      symmetricKey,
      ownerPublicKey,
      ownerPrivateKey
    );

    return {
      encryptedFile,
      encryptedSymmetricKey,
      symmetricKey
    };
  }

  /**
   * Descifra un archivo utilizando la clave privada del propietario para obtener la clave simétrica.
   * @param encryptedFile - Datos del archivo cifrado.
   * @param encryptedSymmetricKey - Clave simétrica cifrada para el propietario.
   * @param ownerPublicKey - Clave pública del propietario en formato PEM.
   * @param ownerPrivateKey - Clave privada del propietario en formato PEM.
   * @returns Datos del archivo descifrados como Buffer.
   */
  static decryptFileAsOwner(
    encryptedFile: string,
    encryptedSymmetricKey: string,
    ownerPublicKey: string,
    ownerPrivateKey: string
  ): Buffer {
    // Descifrar clave simétrica
    const symmetricKey = KeyManager.decryptFromSender(
      encryptedSymmetricKey,
      ownerPublicKey,
      ownerPrivateKey
    );

    // Descifrar archivo
    return this.decryptFile(encryptedFile, symmetricKey);
  }

  /**
   * Recifra la clave simétrica para compartirla con otro usuario.
   * Descifra la clave simétrica con las claves del propietario y la vuelve a cifrar con la clave pública del destinatario.
   * @param encryptedSymmetricKey - Clave simétrica cifrada actualmente.
   * @param ownerPublicKey - Clave pública del propietario en formato PEM.
   * @param ownerPrivateKey - Clave privada del propietario en formato PEM.
   * @param recipientPublicKey - Clave pública del destinatario en formato PEM.
   * @returns Clave simétrica cifrada para el destinatario.
   */
  static reEncryptSymmetricKeyForRecipient(
    encryptedSymmetricKey: string,
    ownerPublicKey: string,
    ownerPrivateKey: string,
    recipientPublicKey: string
  ): string {
    // Descifrar clave simétrica usando las claves del propietario
    const symmetricKey = KeyManager.decryptFromSender(
      encryptedSymmetricKey,
      ownerPublicKey,
      ownerPrivateKey
    );

    // Recifrar para el destinatario
    return KeyManager.encryptForRecipient(
      symmetricKey,
      recipientPublicKey,
      ownerPrivateKey
    );
  }

  /**
   * Descifra un archivo como usuario con acceso compartido (no propietario).
   * @param encryptedFile - Datos del archivo cifrado.
   * @param encryptedSymmetricKey - Clave simétrica cifrada para este usuario.
   * @param ownerPublicKey - Clave pública del propietario del documento en formato PEM.
   * @param userPrivateKey - Clave privada de este usuario en formato PEM.
   * @returns Datos del archivo descifrados como Buffer.
   */
  static decryptFileAsSharedUser(
    encryptedFile: string,
    encryptedSymmetricKey: string,
    ownerPublicKey: string,
    userPrivateKey: string
  ): Buffer {
    // Descifrar clave simétrica
    const symmetricKey = KeyManager.decryptFromSender(
      encryptedSymmetricKey,
      ownerPublicKey,
      userPrivateKey
    );

    // Descifrar archivo
    return this.decryptFile(encryptedFile, symmetricKey);
  }

  /**
   * Calcula el hash SHA-256 del contenido de un archivo para verificar su integridad.
   * @param fileData - Datos del archivo a hashear.
   * @returns Hash SHA-256 en formato hexadecimal.
   */
  static hashFile(fileData: Buffer): string {
    return crypto.createHash('sha256').update(fileData).digest('hex');
  }

  /**
   * Verifica la integridad de un archivo comparando su hash calculado con el esperado.
   * @param fileData - Datos del archivo a verificar.
   * @param expectedHash - Hash SHA-256 esperado (hexadecimal).
   * @returns `true` si coinciden, `false` en caso contrario.
   */
  static verifyFileHash(fileData: Buffer, expectedHash: string): boolean {
    const actualHash = this.hashFile(fileData);
    return actualHash === expectedHash;
  }

  /**
   * Genera un hash de metadatos para almacenamiento en blockchain.
   * Combina el nombre del archivo, su tamaño y el hash de contenido.
   * @param filename - Nombre original del archivo.
   * @param size - Tamaño del archivo en bytes.
   * @param contentHash - Hash SHA-256 del contenido del archivo.
   * @returns Hash combinado en formato hexadecimal.
   */
  static generateMetadataHash(filename: string, size: number, contentHash: string): string {
    const metadata = `${filename}:${size}:${contentHash}`;
    return crypto.createHash('sha256').update(metadata).digest('hex');
  }
}
