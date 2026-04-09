import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, authenticateEvenIfSuspended } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth.schema';

const router = Router();

// ========================================
// NEW WALLET-BASED AUTHENTICATION ROUTES
// ========================================

// Public routes - Wallet-based authentication
router.post('/prepare-register', authLimiter, AuthController.prepareRegister);
router.post('/wallet-login', authLimiter, AuthController.walletLogin);
router.get('/challenge/:walletAddress', authLimiter, AuthController.getChallenge);

// Protected routes - Key management
router.post('/update-keys', authenticate, authLimiter, AuthController.updateKeys);

// ========================================
// LEGACY AUTHENTICATION ROUTES (DEPRECATED)
// ========================================

// Public routes (con rate limiting estricto)
router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/refresh', generalLimiter, AuthController.refresh);

// Two-Factor Authentication routes
router.post('/2fa/verify', authLimiter, AuthController.verify2FA); // Public (usa tempToken)

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticateEvenIfSuspended, AuthController.me);
router.post('/change-password', authenticate, authLimiter, validateBody(changePasswordSchema), AuthController.changePassword);

// Protected 2FA routes
router.get('/2fa/status', authenticate, AuthController.get2FAStatus);
router.post('/2fa/setup', authenticate, AuthController.setup2FA);
router.post('/2fa/enable', authenticate, authLimiter, AuthController.enable2FA);
router.post('/2fa/disable', authenticate, authLimiter, AuthController.disable2FA);
router.post('/2fa/regenerate-backup-codes', authenticate, authLimiter, AuthController.regenerateBackupCodes);

export default router;
