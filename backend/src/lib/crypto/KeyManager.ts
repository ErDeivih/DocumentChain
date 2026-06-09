import crypto from 'crypto';

/**
 * Gestiona la generación y administración de pares de claves RSA-OAEP.
 * Las claves se utilizan para cifrar/descifrar las claves simétricas de archivos.
 * No se derivan de la wallet; es un par de claves independiente por usuario.
 */
export class KeyManager {
  /**
   * Genera un nuevo par de claves RSA-OAEP de 4096 bits en formato PEM.
   * Las claves del backend deben coincidir con las expectativas del frontend (RSA-OAEP) para evitar errores de importación.
   * @returns Objeto con la clave pública y la clave privada en formato PEM.
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
   * Cifra una clave privada con la contraseña del usuario mediante AES-256-GCM.
   * Deriva la clave de cifrado desde la contraseña usando PBKDF2.
   * @param privateKey - Clave privada en formato PEM.
   * @param password - Contraseña del usuario.
   * @returns Clave privada cifrada en formato `salt:iv:authTag:encryptedData`.
   */
  static encryptPrivateKey(privateKey: string, password: string): string {
    // Derivar clave de cifrado desde la contraseña usando PBKDF2
    const salt = crypto.randomBytes(32);
    const key = crypto.pbkdf2Sync(password, salt, 600000, 32, 'sha256');

    // Cifrar clave privada
    const iv = crypto.randomBytes(12); // IV de 96 bits para GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();

    // Formato de salida: salt:iv:authTag:encryptedData
    return `${salt.toString('base64')}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  /**
   * Descifra una clave privada con la contraseña del usuario.
   * @param encryptedPrivateKey - Clave privada cifrada en formato `salt:iv:authTag:encryptedData`.
   * @param password - Contraseña del usuario.
   * @returns Clave privada descifrada en formato PEM.
   * @throws Error si el descifrado falla (contraseña incorrecta o datos corruptos).
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

    // Derivar clave de descifrado desde la contraseña
    const key = crypto.pbkdf2Sync(password, salt, 600000, 32, 'sha256');

    // Descifrar clave privada
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
   * Valida que una cadena sea una clave pública válida en formato PEM.
   * @param publicKey - Clave pública a validar.
   * @returns `true` si es válida, `false` en caso contrario.
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
   * Valida que una cadena sea una clave privada válida en formato PEM.
   * @param privateKey - Clave privada a validar.
   * @returns `true` si es válida, `false` en caso contrario.
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
   * Genera una clave de recuperación para la restauración de la cuenta.
   * @returns Clave de recuperación codificada en base64 (256 bits de entropía).
   */
  static generateRecoveryKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Calcula el hash SHA-256 de una clave de recuperación para su almacenamiento seguro.
   * @param recoveryKey - Clave de recuperación a hashear.
   * @returns Hash SHA-256 de la clave de recuperación.
   */
  static hashRecoveryKey(recoveryKey: string): string {
    const salt = Buffer.from('DocumentChainRecoveryKeySalt2026');
    const key = crypto.pbkdf2Sync(recoveryKey, salt, 600000, 32, 'sha256');
    return key.toString('hex');
  }

  /**
   * Cifra una clave privada con una clave de recuperación mediante AES-256-GCM.
   * Crea una segunda capa de cifrado de la clave privada para fines de recuperación.
   * @param privateKey - Clave privada en formato PEM.
   * @param recoveryKey - Clave de recuperación (base64).
   * @returns Clave privada cifrada en formato `iv:authTag:encryptedData`.
   */
  static encryptPrivateKeyWithRecovery(privateKey: string, recoveryKey: string): string {
    // Derivar clave de cifrado desde la clave de recuperación usando SHA-256
    const key = crypto.createHash('sha256').update(Buffer.from(recoveryKey, 'base64')).digest();

    // Cifrar clave privada
    const iv = crypto.randomBytes(12); // IV de 96 bits para GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();

    // Formato de salida: iv:authTag:encryptedData
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  /**
   * Descifra una clave privada con una clave de recuperación.
   * @param encryptedPrivateKey - Clave privada cifrada en formato `iv:authTag:encryptedData`.
   * @param recoveryKey - Clave de recuperación (base64).
   * @returns Clave privada descifrada en formato PEM.
   * @throws Error si el descifrado falla (clave de recuperación incorrecta o datos corruptos).
   */
  static decryptPrivateKeyWithRecovery(encryptedPrivateKey: string, recoveryKey: string): string {
    const parts = encryptedPrivateKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de clave privada encriptada inválido');
    }

    const [ivB64, authTagB64, encryptedData] = parts;
    
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    // Derivar clave de descifrado desde la clave de recuperación
    const key = crypto.createHash('sha256').update(Buffer.from(recoveryKey, 'base64')).digest();

    // Descifrar clave privada
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
