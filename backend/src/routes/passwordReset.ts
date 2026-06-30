import { Router } from 'express';
import { EmailController } from '../controllers/EmailController';
import { authLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validator';
import { z } from 'zod';

const router = Router();

const forgotPasswordSchema = z.object({
  email: z.string().email('Se requiere un email válido')
});

const verifyResetTokenSchema = z.object({
  token: z.string().min(1, 'Se requiere el token de restablecimiento'),
  recoveryKey: z.string().min(1, 'Se requiere la clave de recuperación'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Se requiere el token de restablecimiento'),
  newEncryptedPrivateKey: z.string().min(1, 'Se requiere la clave privada cifrada'),
  newSalt: z.string().min(1, 'Se requiere la nueva sal'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128)
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
});

router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), EmailController.forgotPassword);
router.post('/reset-password/verify', authLimiter, validateBody(verifyResetTokenSchema), EmailController.resetPasswordVerify);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), EmailController.resetPassword);

export default router;
