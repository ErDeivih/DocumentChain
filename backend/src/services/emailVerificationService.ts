import crypto from 'crypto';
import prisma from '../config/database';
import { emailService } from './emailService';
import { logger } from '../utils/logger';

export class EmailVerificationService {
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string; username?: string }> {
    if (!token) {
      throw Object.assign(new Error('El token es obligatorio'), { statusCode: 400 });
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verification) {
      throw Object.assign(new Error('Token de verificación inválido'), { statusCode: 404 });
    }

    if (verification.verified) {
      throw Object.assign(new Error('Email ya verificado'), { statusCode: 400 });
    }

    if (verification.expiresAt < new Date()) {
      throw Object.assign(new Error('Token de verificación expirado'), { statusCode: 400 });
    }

    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true, verifiedAt: new Date() }
    });

    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true }
    });

    logger.info(`Email verificado para usuario: ${verification.user.username}`);

    return { success: true, message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.', username: verification.user.username };
  }

  static async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw Object.assign(new Error('El email es obligatorio'), { statusCode: 400 });
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
