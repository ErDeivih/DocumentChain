import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth.schema';

const router = Router();

// Public routes (con rate limiting estricto)

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/refresh', generalLimiter, AuthController.refresh);

// Protected routes

router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/change-password', authenticate, authLimiter, validateBody(changePasswordSchema), AuthController.changePassword);

export default router;
