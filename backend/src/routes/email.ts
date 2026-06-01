import { Router } from 'express';
import { EmailController } from '../controllers/EmailController';
import { authLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validator';
import { z } from 'zod';

/**
 * Router de gestión de correo electrónico.
 * Expone endpoints para verificación de cuenta y restablecimiento de contraseña.
 */
const router = Router();

const emailSchema = z.object({
  email: z.string().email('Se requiere un email válido').toLowerCase().trim(),
});

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
router.post('/resend-verification', authLimiter, validateBody(emailSchema), EmailController.resendVerification);

export default router;
