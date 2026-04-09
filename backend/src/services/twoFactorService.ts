import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { Argon2Service } from './argon2Service';
import logger from '../utils/logger';

/**
 * TwoFactorService - Two-Factor Authentication (2FA/TOTP)
 * 
 * Implementa TOTP (Time-based One-Time Password) según RFC 6238
 * Compatible con:
 * - Google Authenticator
 * - Authy
 * - 1Password
 * - Microsoft Authenticator
 * 
 * Características:
 * - Códigos de 6 dígitos
 * - Ventana de 30 segundos
 * - Tolerancia de ±60 segundos (sincronización)
 * - 10 códigos de respaldo
 * - QR code para fácil setup
 */

export interface TwoFactorSetup {
  secret: string;           // Base32 secret para app
  qrCode: string;          // Data URL de QR code
  backupCodes: string[];   // 10 códigos de respaldo
  otpauthUrl: string;      // URL para escaneo manual
}

export interface BackupCode {
  code: string;            // Hash del código
  used: boolean;
  createdAt: Date;
  usedAt?: Date;
}

export interface TwoFactorVerification {
  valid: boolean;
  type: 'totp' | 'backup';
  remainingBackupCodes?: number;
}

export class TwoFactorService {
  private static readonly ISSUER = 'DecentralizedFS';
  private static readonly WINDOW = 1; // ±1 ventana (±60 segundos)
  private static readonly BACKUP_CODE_LENGTH = 8;
  private static readonly BACKUP_CODE_COUNT = 10;

  /**
   * Configurar 2FA para un usuario
   * Genera secret, QR code y códigos de respaldo
   * 
   * ⚠️ IMPORTANTE: El secret debe guardarse cifrado en BD
   * ⚠️ Los backup codes se muestran UNA SOLA VEZ
   * 
   * @param userEmail - Email del usuario (se muestra en app)
   * @param username - Username (opcional, para identificación)
   * @returns Setup completo con QR code y backup codes
   * 
   * @example
   * const setup = await TwoFactorService.setup('user@example.com', 'johndoe');
   * // Guardar setup.secret cifrado en BD
   * // Mostrar setup.qrCode al usuario
   * // Mostrar setup.backupCodes UNA VEZ (el usuario debe guardarlos)
   */
  static async setup(userEmail: string, username?: string): Promise<TwoFactorSetup> {
    try {
      // Generar secret TOTP
      const secret = speakeasy.generateSecret({
        name: `${this.ISSUER} (${userEmail})`,
        issuer: this.ISSUER,
        length: 32, // 32 caracteres base32
      });

      if (!secret.otpauth_url || !secret.base32) {
        throw new Error('Error al generar secreto TOTP');
      }

      // Generar QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Generar códigos de respaldo
      const backupCodes = this.generateBackupCodes();

      logger.info(`2FA setup generated for user: ${userEmail}`);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
        otpauthUrl: secret.otpauth_url,
      };

    } catch (error) {
      logger.error('Error al configurar 2FA:', error);
      throw new Error('Error al configurar 2FA');
    }
  }

  /**
   * Generar códigos de respaldo
   * Formato: XXXXXXXX (8 caracteres hexadecimales uppercase)
   * 
   * @returns Array de 10 códigos
   * 
   * @example
   * const codes = TwoFactorService.generateBackupCodes();
   * // ['A3F8C2D1', 'B7E2F5A9', ...]
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];

    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = crypto
        .randomBytes(this.BACKUP_CODE_LENGTH / 2)
        .toString('hex')
        .toUpperCase();
      
      codes.push(code);
    }

    return codes;
  }

  /**
   * Hash códigos de respaldo para almacenamiento seguro
   * ⚠️ Los códigos se hashean con Argon2id (irreversible)
   * 
   * @param backupCodes - Códigos en texto plano
   * @returns Array con códigos hasheados
   * 
   * @example
   * const hashed = await TwoFactorService.hashBackupCodes(codes);
   * // Guardar en BD: user.twoFactorBackupCodes = JSON.stringify(hashed)
   */
  static async hashBackupCodes(backupCodes: string[]): Promise<BackupCode[]> {
    try {
      const hashed: BackupCode[] = [];

      for (const code of backupCodes) {
        const hash = await Argon2Service.hash(code);
        hashed.push({
          code: hash,
          used: false,
          createdAt: new Date(),
        });
      }

      return hashed;

    } catch (error) {
      logger.error('Error al hashear códigos de respaldo:', error);
      throw new Error('Error al hashear códigos de respaldo');
    }
  }

  /**
   * Verificar código TOTP
   * Ventana de tolerancia: ±60 segundos (para sincronización de reloj)
   * 
   * @param token - Código de 6 dígitos del usuario
   * @param secret - Secret almacenado en BD (base32)
   * @returns true si válido
   * 
   * @example
   * const isValid = TwoFactorService.verifyTOTP('123456', user.twoFactorSecret);
   * if (isValid) {
   *   // Código correcto, permitir acceso
   * }
   */
  static verifyTOTP(token: string, secret: string): boolean {
    try {
      // Normalizar token (remover espacios)
      const normalizedToken = token.replace(/\s/g, '');

      // Validar formato
      if (!/^\d{6}$/.test(normalizedToken)) {
        logger.warn('Formato de token TOTP inválido');
        return false;
      }

      // Verificar con speakeasy
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: normalizedToken,
        window: this.WINDOW, // ±60 segundos
      });

      if (isValid) {
        logger.debug('Verificación TOTP exitosa');
      } else {
        logger.warn('Verificación TOTP fallida');
      }

      return isValid;

    } catch (error) {
      logger.error('Error al verificar TOTP:', error);
      return false;
    }
  }

  /**
   * Verificar código de respaldo
   * ⚠️ Cada código solo puede usarse UNA VEZ
   * 
   * @param token - Código de respaldo ingresado por usuario
   * @param backupCodesJson - JSON string de backup codes desde BD
   * @returns Resultado de verificación + códigos restantes
   * 
   * @example
   * const result = await TwoFactorService.verifyBackupCode(
   *   'A3F8C2D1',
   *   user.twoFactorBackupCodes
   * );
   * 
   * if (result.valid) {
   *   // Código válido, actualizar BD con códigos marcados como usados
   *   user.twoFactorBackupCodes = result.updatedCodesJson;
   *   await userRepo.save(user);
   * }
   */
  static async verifyBackupCode(
    token: string,
    backupCodesJson: string
  ): Promise<{
    valid: boolean;
    updatedCodesJson: string;
    remainingCodes: number;
  }> {
    try {
      // Normalizar token
      const normalizedToken = token.replace(/\s/g, '').toUpperCase();

      // Validar formato
      if (!/^[A-F0-9]{8}$/.test(normalizedToken)) {
        logger.warn('Formato de código de respaldo inválido');
        return {
          valid: false,
          updatedCodesJson: backupCodesJson,
          remainingCodes: 0,
        };
      }

      // Parse backup codes
      const backupCodes: BackupCode[] = JSON.parse(backupCodesJson);

      // Buscar código válido no usado
      for (const item of backupCodes) {
        if (item.used) continue;

        const isValid = await Argon2Service.verify(item.code, normalizedToken);

        if (isValid) {
          // Marcar como usado
          item.used = true;
          item.usedAt = new Date();

          const remainingCodes = backupCodes.filter(c => !c.used).length;

          logger.warn(`Código de respaldo usado. Restantes: ${remainingCodes}`);

          return {
            valid: true,
            updatedCodesJson: JSON.stringify(backupCodes),
            remainingCodes,
          };
        }
      }

      // Ningún código coincidió
      logger.warn('Verificación de código de respaldo fallida');
      return {
        valid: false,
        updatedCodesJson: backupCodesJson,
        remainingCodes: backupCodes.filter(c => !c.used).length,
      };

    } catch (error) {
      logger.error('Error al verificar código de respaldo:', error);
      return {
        valid: false,
        updatedCodesJson: backupCodesJson,
        remainingCodes: 0,
      };
    }
  }

  /**
   * Verificar código (intenta TOTP primero, luego backup)
   * 
   * @param token - Código ingresado por usuario
   * @param secret - TOTP secret
   * @param backupCodesJson - Backup codes JSON
   * @returns Resultado de verificación
   * 
   * @example
   * const result = await TwoFactorService.verify(
   *   userToken,
   *   user.twoFactorSecret,
   *   user.twoFactorBackupCodes
   * );
   * 
   * if (result.valid) {
   *   if (result.type === 'backup') {
   *     // Actualizar backup codes en BD
   *     user.twoFactorBackupCodes = result.updatedBackupCodesJson;
   *     await userRepo.save(user);
   *   }
   *   // Permitir acceso
   * }
   */
  static async verify(
    token: string,
    secret: string,
    backupCodesJson: string
  ): Promise<{
    valid: boolean;
    type: 'totp' | 'backup' | null;
    remainingBackupCodes?: number;
    updatedBackupCodesJson?: string;
  }> {
    // 1. Intentar TOTP primero
    const totpValid = this.verifyTOTP(token, secret);
    if (totpValid) {
      return {
        valid: true,
        type: 'totp',
      };
    }

    // 2. Intentar backup code
    const backupResult = await this.verifyBackupCode(token, backupCodesJson);
    if (backupResult.valid) {
      return {
        valid: true,
        type: 'backup',
        remainingBackupCodes: backupResult.remainingCodes,
        updatedBackupCodesJson: backupResult.updatedCodesJson,
      };
    }

    // 3. Ambos fallaron
    return {
      valid: false,
      type: null,
    };
  }

  /**
   * Contar códigos de respaldo restantes
   * 
   * @param backupCodesJson - JSON de backup codes
   * @returns Cantidad de códigos no usados
   */
  static countRemainingBackupCodes(backupCodesJson: string): number {
    try {
      const backupCodes: BackupCode[] = JSON.parse(backupCodesJson);
      return backupCodes.filter(c => !c.used).length;
    } catch (error) {
      logger.error('Error al contar códigos de respaldo:', error);
      return 0;
    }
  }

  /**
   * Generar nuevos códigos de respaldo (regenerar)
   * ⚠️ Invalida todos los códigos anteriores
   * 
   * @returns Nuevos códigos (sin hashear)
   */
  static regenerateBackupCodes(): string[] {
    return this.generateBackupCodes();
  }

  /**
   * Generar código TOTP actual (para testing)
   * 
   * @param secret - Secret base32
   * @returns Código de 6 dígitos actual
   */
  static generateCurrentTOTP(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }

  /**
   * Validar formato de secret TOTP
   * 
   * @param secret - Secret a validar
   * @returns true si válido
   */
  static isValidSecret(secret: string): boolean {
    // Base32 debe tener longitud múltiplo de 8
    // Solo caracteres A-Z y 2-7
    return /^[A-Z2-7]{32,}$/.test(secret) && secret.length % 8 === 0;
  }
}
