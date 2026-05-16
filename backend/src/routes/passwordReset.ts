import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validator';
import { z } from 'zod';

/**
 * Router de restablecimiento de contraseña.
 * Expone endpoints para solicitar y confirmar el cambio de contraseña mediante token de recuperación.
 */
const router = Router();

/**
 * Schema de validación para la solicitud de restablecimiento de contraseña.
 */
const forgotPasswordSchema = z.object({
  email: z.string().email('Se requiere un email válido')
});

/**
 * Schema de validación para la confirmación de restablecimiento de contraseña.
 */
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Se requiere el token de restablecimiento'),
  recoveryKey: z.string().min(1, 'Se requiere la clave de recuperación'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128)
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
});

// Rutas de restablecimiento de contraseña (públicas pero con límite de tasa)
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), AuthController.resetPassword);

export default router;
