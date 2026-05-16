import { Router } from 'express';
import { EmailController } from '../controllers/EmailController';

/**
 * Router de gestión de correo electrónico.
 * Expone endpoints para verificación de cuenta y restablecimiento de contraseña.
 */
const router = Router();

// Verificación de email

/**
 * GET /email/verify/:token
 * Verifica la dirección de correo electrónico de un usuario mediante un token de verificación.
 */
router.get('/verify/:token', EmailController.verifyEmail);

/**
 * POST /email/resend-verification
 * Reenvía el correo de verificación a la dirección electrónica del usuario.
 */
router.post('/resend-verification', EmailController.resendVerification);

// Reset de contraseña

/**
 * POST /email/forgot-password
 * Solicita el envío de un enlace de restablecimiento de contraseña al correo del usuario.
 */
router.post('/forgot-password', EmailController.forgotPassword);

/**
 * POST /email/reset-password
 * Restablece la contraseña del usuario utilizando un token de recuperación válido.
 */
router.post('/reset-password', EmailController.resetPassword);

export default router;
