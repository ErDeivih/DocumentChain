import { Request, Response } from 'express';
import { EmailVerificationService } from '../services/emailVerificationService';
import { PasswordResetService } from '../services/passwordResetService';
import { logger } from '../utils/logger';

export class EmailController {
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const result = await EmailVerificationService.verifyEmail(req.params.token as string);
      res.json(result);
    } catch (error) {
      logger.error('Error al verificar email:', error);
      const err = error as any;
      res.status(err.statusCode || 500).json({ error: err.message || 'Error interno del servidor' });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await PasswordResetService.forgotPassword(req.body.email, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      logger.error('Error en forgotPassword:', error);
      const err = error as any;
      res.status(err.statusCode || 500).json({ error: err.message || 'Error interno del servidor' });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await PasswordResetService.resetPassword(
        req.body.token, req.body.newPassword, req.body.recoveryKey, ipAddress, userAgent
      );
      res.json(result);
    } catch (error) {
      logger.error('Error en resetPassword:', error);
      const err = error as any;
      res.status(err.statusCode || 500).json({ error: err.message || 'Error interno del servidor' });
    }
  }

  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const result = await EmailVerificationService.resendVerification(req.body.email);
      res.json(result);
    } catch (error) {
      logger.error('Error en resendVerification:', error);
      const err = error as any;
      res.status(err.statusCode || 500).json({ error: err.message || 'Error interno del servidor' });
    }
  }
}
