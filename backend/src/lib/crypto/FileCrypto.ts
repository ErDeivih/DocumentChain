import crypto from 'crypto';
import { KeyManager } from './KeyManager';

/**
 * FileCrypto handles file encryption/decryption using AES-256-GCM
 * Symmetric keys are generated per file and encrypted with user's public key
 */
export class FileCrypto {
  /**
   * Generate a random AES-256 symmetric key
   * @returns 256-bit key as Buffer
   */
  static generateSymmetricKey(): Buffer {
    return crypto.randomBytes(32); // 256 bits
  }

  /**
   * Encrypt file data with AES-256-GCM
   * @param fileData - File data to encrypt
   * @param symmetricKey - 256-bit symmetric key
   * @returns Encrypted data with IV and auth tag (format: iv:authTag:encryptedData)
   */
  static encryptFile(fileData: Buffer, symmetricKey: Buffer): string {
    if (symmetricKey.length !== 32) {
      throw new Error('La clave simétrica debe ser de 256 bits (32 bytes)');
    }

    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(fileData),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData (all base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  /**
   * Decrypt file data encrypted with encryptFile
   * @param encryptedData - Encrypted data (format: iv:authTag:encryptedData)
   * @param symmetricKey - 256-bit symmetric key used for encryption
   * @returns Decrypted file data as Buffer
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
   * Encrypt file and prepare encrypted symmetric key for owner
   * @param fileData - File data to encrypt
   * @param ownerPublicKey - Owner's public key (PEM format)
   * @param ownerPrivateKey - Owner's private key (PEM format)
   * @returns Object with encrypted file and encrypted symmetric key
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
    // Generate symmetric key
    const symmetricKey = this.generateSymmetricKey();

    // Encrypt file
    const encryptedFile = this.encryptFile(fileData, symmetricKey);

    // Encrypt symmetric key with owner's public key
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
   * Decrypt file using owner's private key to decrypt the symmetric key
   * @param encryptedFile - Encrypted file data
   * @param encryptedSymmetricKey - Encrypted symmetric key
   * @param ownerPublicKey - Owner's public key (PEM format)
   * @param ownerPrivateKey - Owner's private key (PEM format)
   * @returns Decrypted file data as Buffer
   */
  static decryptFileAsOwner(
    encryptedFile: string,
    encryptedSymmetricKey: string,
    ownerPublicKey: string,
    ownerPrivateKey: string
  ): Buffer {
    // Decrypt symmetric key
    const symmetricKey = KeyManager.decryptFromSender(
      encryptedSymmetricKey,
      ownerPublicKey,
      ownerPrivateKey
    );

    // Decrypt file
    return this.decryptFile(encryptedFile, symmetricKey);
  }

  /**
   * Re-encrypt symmetric key for sharing with another user
   * Used when sharing a document - we decrypt the symmetric key with owner's key,
   * then re-encrypt it with recipient's public key
   * @param encryptedSymmetricKey - Current encrypted symmetric key
   * @param ownerPublicKey - Owner's public key (PEM format)
   * @param ownerPrivateKey - Owner's private key (PEM format)
   * @param recipientPublicKey - Recipient's public key (PEM format)
   * @returns Encrypted symmetric key for recipient
   */
  static reEncryptSymmetricKeyForRecipient(
    encryptedSymmetricKey: string,
    ownerPublicKey: string,
    ownerPrivateKey: string,
    recipientPublicKey: string
  ): string {
    // Decrypt symmetric key using owner's keys
    const symmetricKey = KeyManager.decryptFromSender(
      encryptedSymmetricKey,
      ownerPublicKey,
      ownerPrivateKey
    );

    // Re-encrypt for recipient
    return KeyManager.encryptForRecipient(
      symmetricKey,
      recipientPublicKey,
      ownerPrivateKey
    );
  }

  /**
   * Decrypt file as a shared user (not owner)
   * @param encryptedFile - Encrypted file data
   * @param encryptedSymmetricKey - Symmetric key encrypted for this user
   * @param ownerPublicKey - Document owner's public key (PEM format)
   * @param userPrivateKey - This user's private key (PEM format)
   * @returns Decrypted file data as Buffer
   */
  static decryptFileAsSharedUser(
    encryptedFile: string,
    encryptedSymmetricKey: string,
    ownerPublicKey: string,
    userPrivateKey: string
  ): Buffer {
    // Decrypt symmetric key
    const symmetricKey = KeyManager.decryptFromSender(
      encryptedSymmetricKey,
      ownerPublicKey,
      userPrivateKey
    );

    // Decrypt file
    return this.decryptFile(encryptedFile, symmetricKey);
  }

  /**
   * Hash file content to verify integrity
   * @param fileData - File data to hash
   * @returns SHA-256 hash as hex string
   */
  static hashFile(fileData: Buffer): string {
    return crypto.createHash('sha256').update(fileData).digest('hex');
  }

  /**
   * Verify file integrity using hash
   * @param fileData - File data to verify
   * @param expectedHash - Expected SHA-256 hash (hex string)
   * @returns true if hash matches, false otherwise
   */
  static verifyFileHash(fileData: Buffer, expectedHash: string): boolean {
    const actualHash = this.hashFile(fileData);
    return actualHash === expectedHash;
  }

  /**
   * Generate metadata hash for blockchain storage
   * Combines filename, size, and content hash
   * @param filename - Original filename
   * @param size - File size in bytes
   * @param contentHash - SHA-256 hash of file content
   * @returns Combined hash as hex string
   */
  static generateMetadataHash(filename: string, size: number, contentHash: string): string {
    const metadata = `${filename}:${size}:${contentHash}`;
    return crypto.createHash('sha256').update(metadata).digest('hex');
  }
}
