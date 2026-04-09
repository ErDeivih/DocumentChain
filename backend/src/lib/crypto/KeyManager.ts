import crypto from 'crypto';

/**
 * KeyManager handles ECDH P-256 key pair generation and management
 * Keys are used for encrypting/decrypting file symmetric keys
 * NOT derived from wallet - separate key pair per user
 */
export class KeyManager {
  /**
   * Generate a new RSA-OAEP key pair (4096 bits) in PEM format.
   * Backend keys must match frontend expectations (RSA-OAEP) to avoid import errors.
   */
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Encrypt private key with user password using AES-256-GCM
   * @param privateKey - Private key in PEM format
   * @param password - User password
   * @returns Encrypted private key with IV and auth tag (format: iv:authTag:encryptedData)
   */
  static encryptPrivateKey(privateKey: string, password: string): string {
    // Derive encryption key from password using PBKDF2
    const salt = crypto.randomBytes(32);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    // Encrypt private key
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();

    // Return format: salt:iv:authTag:encryptedData
    return `${salt.toString('base64')}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  /**
   * Decrypt private key with user password
   * @param encryptedPrivateKey - Encrypted private key (format: salt:iv:authTag:encryptedData)
   * @param password - User password
   * @returns Decrypted private key in PEM format
   * @throws Error if decryption fails (wrong password or corrupted data)
   */
  static decryptPrivateKey(encryptedPrivateKey: string, password: string): string {
    const parts = encryptedPrivateKey.split(':');
    if (parts.length !== 4) {
      throw new Error('Formato de clave privada encriptada inválido');
    }

    const [saltB64, ivB64, authTagB64, encryptedData] = parts;
    
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    // Derive decryption key from password
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    // Decrypt private key
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    try {
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Error al desencriptar clave privada - contraseña inválida o datos corruptos');
    }
  }

  /**
   * Derive shared secret using ECDH
   * @param privateKey - Your private key in PEM format
   * @param publicKey - Other party's public key in PEM format
   * @returns Shared secret as Buffer
   */
  static deriveSharedSecret(privateKey: string, publicKey: string): Buffer {
    const privateKeyObj = crypto.createPrivateKey(privateKey);
    const publicKeyObj = crypto.createPublicKey(publicKey);

    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(privateKeyObj.export({ type: 'pkcs8', format: 'der' }) as Buffer);

    const publicKeyDer = publicKeyObj.export({ type: 'spki', format: 'der' }) as Buffer;
    
    return ecdh.computeSecret(publicKeyDer);
  }

  /**
   * Encrypt data with recipient's public key (hybrid encryption)
   * Uses ECDH to derive shared secret, then encrypts with AES-256-GCM
   * @param data - Data to encrypt (typically a symmetric key)
   * @param recipientPublicKey - Recipient's public key in PEM format
   * @param senderPrivateKey - Sender's private key in PEM format
   * @returns Encrypted data (format: iv:authTag:encryptedData)
   */
  static encryptForRecipient(
    data: Buffer,
    recipientPublicKey: string,
    senderPrivateKey: string
  ): string {
    // Derive shared secret
    const sharedSecret = this.deriveSharedSecret(senderPrivateKey, recipientPublicKey);
    
    // Derive encryption key from shared secret
    const key = crypto.createHash('sha256').update(sharedSecret).digest();

    // Encrypt data
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  /**
   * Decrypt data encrypted with encryptForRecipient
   * @param encryptedData - Encrypted data (format: iv:authTag:encryptedData)
   * @param senderPublicKey - Sender's public key in PEM format
   * @param recipientPrivateKey - Recipient's private key in PEM format
   * @returns Decrypted data as Buffer
   */
  static decryptFromSender(
    encryptedData: string,
    senderPublicKey: string,
    recipientPrivateKey: string
  ): Buffer {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de datos encriptados inválido');
    }

    const [ivB64, authTagB64, dataB64] = parts;
    
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');

    // Derive shared secret
    const sharedSecret = this.deriveSharedSecret(recipientPrivateKey, senderPublicKey);
    
    // Derive decryption key from shared secret
    const key = crypto.createHash('sha256').update(sharedSecret).digest();

    // Decrypt data
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    try {
      return Buffer.concat([
        decipher.update(data),
        decipher.final()
      ]);
    } catch (error) {
      throw new Error('Error al desencriptar datos - claves inválidas o datos corruptos');
    }
  }

  /**
   * Validate that a string is a valid PEM-formatted public key
   * @param publicKey - Public key to validate
   * @returns true if valid, false otherwise
   */
  static isValidPublicKey(publicKey: string): boolean {
    try {
      const keyObj = crypto.createPublicKey(publicKey);
      return keyObj.asymmetricKeyType === 'ec' || keyObj.asymmetricKeyType === 'rsa';
    } catch {
      return false;
    }
  }

  /**
   * Validate that a string is a valid PEM-formatted private key
   * @param privateKey - Private key to validate
   * @returns true if valid, false otherwise
   */
  static isValidPrivateKey(privateKey: string): boolean {
    try {
      const keyObj = crypto.createPrivateKey(privateKey);
      return keyObj.asymmetricKeyType === 'ec' || keyObj.asymmetricKeyType === 'rsa';
    } catch {
      return false;
    }
  }

  /**
   * Generate a recovery key for account recovery
   * @returns Recovery key as base64 string (256 bits of entropy)
   */
  static generateRecoveryKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Hash recovery key for storage
   * @param recoveryKey - Recovery key to hash
   * @returns SHA-256 hash of the recovery key
   */
  static hashRecoveryKey(recoveryKey: string): string {
    return crypto.createHash('sha256').update(recoveryKey).digest('hex');
  }

  /**
   * Encrypt private key with recovery key using AES-256-GCM
   * This creates a second encryption of the private key for recovery purposes
   * @param privateKey - Private key in PEM format
   * @param recoveryKey - Recovery key (base64)
   * @returns Encrypted private key with IV and auth tag (format: iv:authTag:encryptedData)
   */
  static encryptPrivateKeyWithRecovery(privateKey: string, recoveryKey: string): string {
    // Derive encryption key from recovery key using SHA-256
    const key = crypto.createHash('sha256').update(Buffer.from(recoveryKey, 'base64')).digest();

    // Encrypt private key
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encryptedData
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  /**
   * Decrypt private key with recovery key
   * @param encryptedPrivateKey - Encrypted private key (format: iv:authTag:encryptedData)
   * @param recoveryKey - Recovery key (base64)
   * @returns Decrypted private key in PEM format
   * @throws Error if decryption fails (wrong recovery key or corrupted data)
   */
  static decryptPrivateKeyWithRecovery(encryptedPrivateKey: string, recoveryKey: string): string {
    const parts = encryptedPrivateKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de clave privada encriptada inválido');
    }

    const [ivB64, authTagB64, encryptedData] = parts;
    
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    // Derive decryption key from recovery key
    const key = crypto.createHash('sha256').update(Buffer.from(recoveryKey, 'base64')).digest();

    // Decrypt private key
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    try {
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Error al desencriptar clave privada - clave de recuperación inválida o datos corruptos');
    }
  }
}
