import crypto from 'crypto';
import prisma from '../config/database';
import { Argon2Service } from './argon2Service';
import { emailService } from './emailService';
import { KeyManager } from '../lib/crypto/KeyManager';
import { validatePassword } from '../validators/passwordPolicy';
import { logger } from '../utils/logger';

export class PasswordResetService {

  /**
   * Inicia el proceso de restablecimiento de contraseña.
   * Genera un token, lo almacena con expiración de 1 hora y envía un email al usuario.
   * Siempre devuelve un mensaje genérico para no revelar si el email existe.
   * @param email - Email del usuario que solicita el restablecimiento.
   * @param ipAddress - Dirección IP del solicitante.
   * @param userAgent - User-Agent del solicitante.
   * @returns Objeto con success y mensaje descriptivo.
   */
  static async forgotPassword(email: string, ipAddress: string, userAgent: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw Object.assign(new Error('El email es obligatorio'), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      logger.warn(`Solicitud de restablecimiento para email inexistente: ${email}`);
      return { success: true, message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt, ipAddress, userAgent }
    });

    try {
      await emailService.sendPasswordResetEmail(user.email, user.username, token);
    } catch (emailError) {
      logger.error(`Error crítico al enviar email de restablecimiento a ${user.email}: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
      return { success: false, message: 'No se pudo enviar el email de restablecimiento. Inténtelo de nuevo más tarde.' };
    }

    logger.info(`Solicitud de restablecimiento de contraseña para usuario: ${user.username}`);

    return { success: true, message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
  }

  /**
   * Verifica un token de restablecimiento y la clave de recuperación.
   * Valida que el token exista, no esté usado ni expirado, y que el hash
   * de la clave de recuperación coincida con el almacenado.
   * Devuelve los datos necesarios para que el frontend descifre y re-cifre la clave privada.
   * @param token - Token de restablecimiento enviado por email.
   * @param recoveryKey - Clave de recuperación del usuario en texto plano (Base64).
   * @returns Datos de recuperación: { encryptedPrivateKeyRecovery, recoveryKeySalt }.
   */
  static async verifyResetToken(
    token: string,
    recoveryKey: string,
  ): Promise<{ encryptedPrivateKeyRecovery: string; recoveryKeySalt: string | null }> {
    if (!token || !recoveryKey) {
      throw Object.assign(new Error('El token y la clave de recuperación son obligatorios'), { status: 400 });
    }

    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRequest) {
      throw Object.assign(new Error('Token de restablecimiento inválido'), { status: 404 });
    }

    if (resetRequest.used) {
      throw Object.assign(new Error('Token de restablecimiento ya utilizado'), { status: 400 });
    }

    if (resetRequest.expiresAt < new Date()) {
      throw Object.assign(new Error('Token de restablecimiento expirado'), { status: 400 });
    }

    const recoveryKeySalt = (() => {
      if (!resetRequest.user.recoveryKeySalt) return null;
      try {
        Buffer.from(resetRequest.user.recoveryKeySalt, 'base64');
        return resetRequest.user.recoveryKeySalt;
      } catch {
        throw Object.assign(new Error('Clave de recuperación inválida'), { status: 400 });
      }
    })();

    const saltBuffer = recoveryKeySalt ? Buffer.from(recoveryKeySalt, 'base64') : undefined;
    const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey, saltBuffer);

    if (!resetRequest.user.recoveryKeyHash || resetRequest.user.recoveryKeyHash !== recoveryKeyHash) {
      throw Object.assign(new Error('Clave de recuperación inválida'), { status: 400 });
    }

    if (!resetRequest.user.encryptedPrivateKeyRecovery) {
      throw Object.assign(new Error('La cuenta no tiene clave de recuperación configurada'), { status: 400 });
    }

    return {
      encryptedPrivateKeyRecovery: resetRequest.user.encryptedPrivateKeyRecovery,
      recoveryKeySalt,
    };
  }

  /**
   * Confirma el restablecimiento de contraseña guardando la nueva clave privada cifrada y el hash de contraseña.
   * El frontend ya ha descifrado con la recovery key y re-cifrado con la nueva contraseña.
   */
  /**
   * Confirma el restablecimiento de contraseña guardando la nueva clave privada cifrada y el hash de contraseña.
   * El frontend ya ha descifrado con la recovery key y re-cifrado con la nueva contraseña.
   * Marca el token como usado, actualiza la contraseña y revoca todas las sesiones activas.
   * @param token - Token de restablecimiento.
   * @param newEncryptedPrivateKey - Clave privada re-cifrada con la nueva contraseña.
   * @param newSalt - Nueva sal para el cifrado.
   * @param newPassword - Nueva contraseña en texto plano.
   * @param ipAddress - Dirección IP del solicitante.
   * @param userAgent - User-Agent del solicitante.
   * @returns Objeto con { success, message }.
   */
  static async confirmReset(
    token: string,
    newEncryptedPrivateKey: string,
    newSalt: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!token || !newEncryptedPrivateKey || !newSalt || !newPassword) {
      throw Object.assign(new Error('Faltan datos requeridos para confirmar el restablecimiento'), { status: 400 });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw Object.assign(new Error(`Validación de contraseña fallida: ${passwordValidation.errors.join(', ')}`), { status: 400 });
    }

    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRequest) {
      throw Object.assign(new Error('Token de restablecimiento inválido'), { status: 404 });
    }

    if (resetRequest.used) {
      throw Object.assign(new Error('Token de restablecimiento ya utilizado'), { status: 400 });
    }

    if (resetRequest.expiresAt < new Date()) {
      throw Object.assign(new Error('Token de restablecimiento expirado'), { status: 400 });
    }

    const passwordHash = await Argon2Service.hash(newPassword);

    await prisma.$transaction(async (tx) => {
      const marked = await tx.passwordReset.updateMany({
        where: { id: resetRequest.id, used: false, expiresAt: { gt: new Date() } },
        data: { used: true, usedAt: new Date() },
      });

      if (marked.count !== 1) {
        throw Object.assign(new Error('Token de restablecimiento inválido o ya utilizado'), { status: 400 });
      }

      await tx.user.update({
        where: { id: resetRequest.userId },
        data: {
          passwordHash,
          encryptedPrivateKey: newEncryptedPrivateKey,
        },
      });

      await tx.session.deleteMany({ where: { userId: resetRequest.userId } });
    });

    try {
      await emailService.sendPasswordChangedNotification(
        resetRequest.user.email,
        resetRequest.user.username,
        ipAddress,
        userAgent
      );
    } catch (emailError) {
      logger.warn(`No se pudo enviar la notificación de cambio de contraseña a ${resetRequest.user.email}: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    logger.info(`Restablecimiento de contraseña exitoso para usuario: ${resetRequest.user.username}`);

    return { success: true, message: 'Contraseña cambiada exitosamente. Por favor, inicia sesión con tu nueva contraseña.' };
  }
}
