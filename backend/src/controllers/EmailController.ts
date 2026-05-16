import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { emailService } from '../services/emailService';
import { Argon2Service } from '../services/argon2Service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Controlador de correo electrónico.
 * Gestiona la verificación de direcciones de email, solicitudes de restablecimiento
 * de contraseña y reenvío de enlaces de verificación.
 * Arquitectura MVC: Capa de Controlador.
 */
export class EmailController {
  /**
   * Verifica la dirección de email del usuario mediante un token.
   * Endpoint: GET /api/email/verify/:token
   *
   * @param req - Objeto de solicitud HTTP. Los parámetros deben incluir el token de verificación.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de verificación.
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token as string;

      if (!token) {
        res.status(400).json({ error: 'El token es obligatorio' });
        return;
      }

      // Buscar verificación pendiente
      const verification = await prisma.emailVerification.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!verification) {
        res.status(404).json({ error: 'Token de verificación inválido' });
        return;
      }

      // Verificar si ya fue verificado
      if (verification.verified) {
        res.status(400).json({
          error: 'Email ya verificado',
          message: 'Tu email ya fue verificado anteriormente'
        });
        return;
      }

      // Verificar si expiró (24 horas)
      if (verification.expiresAt < new Date()) {
        res.status(400).json({
          error: 'Token de verificación expirado',
          message: 'El token de verificación ha expirado. Por favor, solicita un nuevo enlace.'
        });
        return;
      }

      // Marcar como verificado
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: {
          verified: true,
          verifiedAt: new Date()
        }
      });

      // Marcar el campo emailVerified del usuario
      await prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true }
      });

      logger.info(`Email verificado para usuario: ${verification.user.username}`);

      res.json({
        success: true,
        message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
        username: verification.user.username
      });
    } catch (error) {
      logger.error('Error al verificar email:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Solicita el restablecimiento de contraseña para un usuario.
   * Endpoint: POST /api/email/forgot-password
   *
   * @param req - Objeto de solicitud HTTP con { email } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con un mensaje genérico de confirmación por seguridad.
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'El email es obligatorio' });
        return;
      }

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Por seguridad, siempre responder exitosamente aunque el email no exista
      if (!user) {
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        res.json({
          success: true,
          message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
        });
        return;
      }

      // Generar token aleatorio
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Obtener IP y User-Agent
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Crear registro de password reset
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          ipAddress,
          userAgent
        }
      });

      // Enviar email (el fallo de envío no debe impedir la respuesta exitosa:
      // el token ya está creado y el usuario no debe recibir un 500 por problemas SMTP)
      try {
        await emailService.sendPasswordResetEmail(
          user.email,
          user.username,
          token
        );
      } catch (emailError) {
        logger.warn(`No se pudo enviar el email de restablecimiento a ${user.email}: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
      }

      logger.info(`Solicitud de restablecimiento de contraseña para usuario: ${user.username}`);

      res.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      });
    } catch (error) {
      logger.error('Error en forgotPassword:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Restablece la contraseña del usuario utilizando un token válido.
   * Endpoint: POST /api/email/reset-password
   *
   * @param req - Objeto de solicitud HTTP con { token, newPassword } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de cambio de contraseña.
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'El token y la nueva contraseña son obligatorios' });
        return;
      }

      // Validar contraseña
      if (newPassword.length < 8) {
        res.status(400).json({ 
          error: 'La contraseña debe tener al menos 8 caracteres' 
        });
        return;
      }

      // Buscar reset pendiente (token es string del body, no params)
      const resetRequest = await prisma.passwordReset.findUnique({
        where: { token: token as string },
        include: { user: true }
      });

      if (!resetRequest) {
        res.status(404).json({ error: 'Token de restablecimiento inválido' });
        return;
      }

      // Verificar si ya fue usado
      if (resetRequest.used) {
        res.status(400).json({
          error: 'Token de restablecimiento ya utilizado',
          message: 'Este enlace ya fue utilizado. Por favor, solicita uno nuevo.'
        });
        return;
      }

      // Verificar si expiró
      if (resetRequest.expiresAt < new Date()) {
        res.status(400).json({
          error: 'Token de restablecimiento expirado',
          message: 'El enlace ha expirado. Por favor, solicita uno nuevo.'
        });
        return;
      }

      // Hashear nueva contraseña
      const passwordHash = await Argon2Service.hash(newPassword);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash }
      });

      // Marcar reset como usado
      await prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: {
          used: true,
          usedAt: new Date()
        }
      });

      // Invalidar todas las sesiones activas (opcional pero recomendado)
      await prisma.session.deleteMany({
        where: { userId: resetRequest.userId }
      });

      // Obtener IP y User-Agent
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Enviar email de confirmación
      await emailService.sendPasswordChangedNotification(
        resetRequest.user.email,
        resetRequest.user.username,
        ipAddress,
        userAgent
      );

      logger.info(`Restablecimiento de contraseña exitoso para usuario: ${resetRequest.user.username}`);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente. Por favor, inicia sesión con tu nueva contraseña.'
      });
    } catch (error) {
      logger.error('Error en resetPassword:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Reenvía el correo de verificación a un usuario no verificado.
   * Endpoint: POST /api/email/resend-verification
   *
   * @param req - Objeto de solicitud HTTP con { email } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de envío.
   */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'El email es obligatorio' });
        return;
      }

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Por seguridad, siempre responder exitosamente
        res.json({
          success: true,
          message: 'Si el email existe y no está verificado, recibirás un nuevo enlace'
        });
        return;
      }

      // Verificar si ya está verificado (campo canónico en User)
      if (user.emailVerified) {
        res.json({
          success: true,
          message: 'Tu email ya está verificado'
        });
        return;
      }

      // Invalidar verificaciones anteriores
      await prisma.emailVerification.deleteMany({
        where: {
          userId: user.id,
          verified: false
        }
      });

      // Generar nuevo token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Crear nueva verificación
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token,
          expiresAt
        }
      });

      // Enviar email
      await emailService.sendVerificationEmail(
        user.email,
        user.username,
        token
      );

      logger.info(`Email de verificación reenviado a usuario: ${user.username}`);

      res.json({
        success: true,
        message: 'Email de verificación enviado. Por favor, revisa tu bandeja de entrada.'
      });
    } catch (error) {
      logger.error('Error en resendVerification:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
