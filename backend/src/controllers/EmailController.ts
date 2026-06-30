import { Request, Response, NextFunction } from 'express';
import { EmailVerificationService } from '../services/emailVerificationService';
import { PasswordResetService } from '../services/passwordResetService';
import { logger } from '../utils/logger';

/**
 * Controlador de email. Endpoints para verificación y reenvío de correos.
 */
export class EmailController {

  /**
   * Verifica la dirección de correo electrónico de un usuario mediante token.
   * Endpoint: GET /api/email/verify/:token
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EmailVerificationService.verifyEmail(req.params.token as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envía un enlace de restablecimiento de contraseña al correo del usuario.
   * Endpoint: POST /api/email/forgot-password
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await PasswordResetService.forgotPassword(req.body.email, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica un token de restablecimiento y la clave de recuperación.
   * Endpoint: POST /api/auth/reset-password/verify
   * @param req - Solicitud HTTP con { token, recoveryKey } en el body.
   * @param res - Respuesta HTTP.
   * @returns Datos de recuperación (encryptedPrivateKeyRecovery, recoveryKeySalt).
   */
  static async resetPasswordVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PasswordResetService.verifyResetToken(
        req.body.token, req.body.recoveryKey
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirma el restablecimiento de contraseña con la clave ya re-cifrada por el frontend.
   * Endpoint: POST /api/auth/reset-password
   * @param {Request} req - Solicitud HTTP con { token, newEncryptedPrivateKey, newSalt, newPasswordHash }
   * @returns {Promise<void>}
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await PasswordResetService.confirmReset(
        req.body.token, req.body.newEncryptedPrivateKey, req.body.newSalt, req.body.newPassword, ipAddress, userAgent
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reenvía el correo de verificación de email al usuario.
   * Endpoint: POST /api/email/resend-verification
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EmailVerificationService.resendVerification(req.body.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
