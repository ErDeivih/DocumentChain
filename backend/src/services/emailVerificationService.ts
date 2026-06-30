import crypto from 'crypto';
import prisma from '../config/database';
import { emailService } from './emailService';
import { logger } from '../utils/logger';

/**
 * Servicio de verificacion de email. Gestiona tokens de verificacion y su envio.
 */
export class EmailVerificationService {

  /**
   * Verifica el email de un usuario usando un token de verificacion.
   * @param {string} token - Token de verificacion de email.
   * @returns {Promise<{success: boolean, message: string, username?: string}>} Resultado con estado de exito y mensaje.
   * @throws {Error} Si el token falta, es invalido, ya fue usado o expiro.
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string; username?: string }> {
    if (!token) {
      throw Object.assign(new Error('El token es obligatorio'), { status: 400 });
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verification) {
      throw Object.assign(new Error('Token de verificación inválido'), { status: 404 });
    }

    if (verification.verified) {
      throw Object.assign(new Error('Email ya verificado'), { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      throw Object.assign(new Error('Token de verificación expirado'), { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true }
      });
      await tx.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true }
      });
    });

    logger.info(`Email verificado para usuario: ${verification.user.username}`);

    return { success: true, message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.', username: verification.user.username };
  }

  /**
   * Reenvia el email de verificacion a la direccion indicada.
   * Genera un nuevo token y lo envia si el usuario existe y no esta verificado.
   * @param {string} email - Direccion de email a la que enviar la verificacion.
   * @returns {Promise<{success: boolean, message: string}>} Resultado con estado de exito y mensaje.
   * @throws {Error} Si falta el email.
   */
  static async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw Object.assign(new Error('El email es obligatorio'), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: true, message: 'Si el email existe y no está verificado, recibirás un nuevo enlace' };
    }

    if (user.emailVerified) {
      return { success: true, message: 'Tu email ya está verificado' };
    }

    await prisma.emailVerification.deleteMany({
      where: { userId: user.id, verified: false }
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt }
    });

    await emailService.sendVerificationEmail(user.email, user.username, token);

    logger.info(`Email de verificación reenviado a usuario: ${user.username}`);

    return { success: true, message: 'Email de verificación enviado. Por favor, revisa tu bandeja de entrada.' };
  }
}
