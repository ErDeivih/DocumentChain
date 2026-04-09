import { Router } from 'express';
import { EmailController } from '../controllers/EmailController';

/**
 * Email Routes
 * Rutas para verificación de email y reset de contraseña
 * Arquitectura MVC: Routes Layer
 */
const router = Router();

// Verificación de email
router.get('/verify/:token', EmailController.verifyEmail);
router.post('/resend-verification', EmailController.resendVerification);

// Reset de contraseña
router.post('/forgot-password', EmailController.forgotPassword);
router.post('/reset-password', EmailController.resetPassword);

export default router;
