import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validator';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth.schema';

/**
 * Router de autenticación y autorización.
 * Expone endpoints para registro, inicio de sesion, refresco de tokens y autenticacion basada en wallet.
 */
const router = Router();

// ========================================
// NEW WALLET-BASED AUTHENTICATION ROUTES
// ========================================

// Public routes - Wallet-based authentication

/**
 * POST /auth/prepare-register
 * Prepara el registro de un nuevo usuario a través de wallet generando los datos necesarios para la transacción on-chain.
 */
router.post('/prepare-register', authLimiter, AuthController.prepareRegister);

/**
 * POST /auth/wallet-login
 * Autentica a un usuario mediante su wallet y firma criptográfica.
 */
router.post('/wallet-login', authLimiter, AuthController.walletLogin);

/**
 * GET /auth/challenge/:walletAddress
 * Genera un reto (challenge) de nonce para que la wallet lo firme durante la autenticación.
 */
router.get('/challenge/:walletAddress', authLimiter, AuthController.getChallenge);

// Protected routes - Key management

/**
 * POST /auth/update-keys
 * Actualiza las claves públicas del usuario autenticado.
 */
router.post('/update-keys', authenticate, authLimiter, AuthController.updateKeys);

// ========================================
// LEGACY AUTHENTICATION ROUTES (DEPRECATED)
// ========================================

// Public routes (con rate limiting estricto)

/**
 * POST /auth/register
 * Registra un nuevo usuario mediante credenciales tradicionales (email y contraseña).
 */
router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);

/**
 * POST /auth/login
 * Inicia sesión con credenciales tradicionales y devuelve tokens de acceso.
 */
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);

/**
 * POST /auth/refresh
 * Refresca el token de acceso utilizando un token de refresco válido.
 */
router.post('/refresh', generalLimiter, AuthController.refresh);

// Protected routes

/**
 * POST /auth/logout
 * Cierra la sesión del usuario autenticado invalidando sus tokens.
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * GET /auth/me
 * Devuelve la información del perfil del usuario autenticado.
 */
router.get('/me', authenticate, AuthController.me);

/**
 * POST /auth/change-password
 * Cambia la contraseña del usuario autenticado tras validar la contraseña actual.
 */
router.post('/change-password', authenticate, authLimiter, validateBody(changePasswordSchema), AuthController.changePassword);

export default router;
