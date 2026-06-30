import crypto from 'crypto';

export class KeyManager {
  /**
   * Deriva un hash de la clave de recuperación usando PBKDF2 para su almacenamiento seguro.
   * @param recoveryKey - Clave de recuperación a hashear.
   * @param salt - Sal específica del usuario (opcional). Si no se proporciona, se usa una sal estática (compatibilidad hacia atrás).
   * @returns Hash PBKDF2 de la clave de recuperación en hexadecimal.
   */
  static hashRecoveryKey(recoveryKey: string, salt?: Buffer): string {
    const effectiveSalt = salt ?? Buffer.from('DocumentChainRecoveryKeySalt2026');
    const key = crypto.pbkdf2Sync(recoveryKey, effectiveSalt, 600000, 32, 'sha256');
    return key.toString('hex');
  }
}
