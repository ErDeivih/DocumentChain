import crypto from 'crypto';
import prisma from '../config/database';
import { Argon2Service } from './argon2Service';
import { emailService } from './emailService';
import { KeyManager } from '../lib/crypto/KeyManager';
import { validatePassword } from '../validators/passwordPolicy';
import { logger } from '../utils/logger';

export class PasswordResetService {
  static async forgotPassword(email: string, ipAddress: string, userAgent: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw Object.assign(new Error('El email es obligatorio'), { statusCode: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
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
      logger.warn(`No se pudo enviar el email de restablecimiento a ${user.email}: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    logger.info(`Solicitud de restablecimiento de contraseña para usuario: ${user.username}`);

    return { success: true, message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
  }

  static async resetPassword(
    token: string,
    newPassword: string,
    recoveryKey: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; message: string }> {
    if (!token || !newPassword || !recoveryKey) {
      throw Object.assign(new Error('El token, la nueva contraseña y la clave de recuperación son obligatorios'), { statusCode: 400 });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw Object.assign(new Error(`Validación de contraseña fallida: ${passwordValidation.errors.join(', ')}`), { statusCode: 400 });
    }

    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRequest) {
      throw Object.assign(new Error('Token de restablecimiento inválido'), { statusCode: 404 });
    }

    if (resetRequest.used) {
      throw Object.assign(new Error('Token de restablecimiento ya utilizado'), { statusCode: 400 });
    }

    if (resetRequest.expiresAt < new Date()) {
      throw Object.assign(new Error('Token de restablecimiento expirado'), { statusCode: 400 });
    }

    const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
    if (!resetRequest.user.recoveryKeyHash || resetRequest.user.recoveryKeyHash !== recoveryKeyHash) {
      throw Object.assign(new Error('Clave de recuperación inválida'), { statusCode: 400 });
    }

    if (!resetRequest.user.encryptedPrivateKeyRecovery) {
      throw Object.assign(new Error('La cuenta no tiene clave de recuperación configurada'), { statusCode: 400 });
    }

    const privateKey = KeyManager.decryptPrivateKeyWithRecovery(
      resetRequest.user.encryptedPrivateKeyRecovery,
      recoveryKey,
    );
    const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, newPassword);
    const passwordHash = await Argon2Service.hash(newPassword);

    await prisma.$transaction(async (tx) => {
      const marked = await tx.passwordReset.updateMany({
        where: { id: resetRequest.id, used: false, expiresAt: { gt: new Date() } },
        data: { used: true, usedAt: new Date() },
      });

      if (marked.count !== 1) {
        throw new Error('Token de restablecimiento inválido o ya utilizado');
      }

      await tx.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash, encryptedPrivateKey },
      });

      await tx.session.deleteMany({ where: { userId: resetRequest.userId } });
    });

    await emailService.sendPasswordChangedNotification(
      resetRequest.user.email,
      resetRequest.user.username,
      ipAddress,
      userAgent
    );

    logger.info(`Restablecimiento de contraseña exitoso para usuario: ${resetRequest.user.username}`);

    return { success: true, message: 'Contraseña cambiada exitosamente. Por favor, inicia sesión con tu nueva contraseña.' };
  }
}
