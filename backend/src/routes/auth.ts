/**
 * @fileoverview Rutas de autenticación y gestión de sesiones.
 *
 * Expone los endpoints de registro, inicio de sesión, cierre de sesión,
 * renovación de tokens JWT y cambio de contraseña. Algunas rutas requieren
 * autenticación previa mediante el middleware {@link authenticate}.
 */
import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth.schema';

const refreshSchema = z.object({ refreshToken: z.string() });

const router = Router();

// Public routes (con rate limiting estricto)

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/refresh', generalLimiter, validateBody(refreshSchema), AuthController.refresh);

// Protected routes

router.post('/logout', authenticate, generalLimiter, AuthController.logout);
router.get('/me', authenticate, generalLimiter, AuthController.me);
router.post('/change-password', authenticate, authLimiter, validateBody(changePasswordSchema), AuthController.changePassword);

export default router;
