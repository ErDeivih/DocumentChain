import express from 'express';
import healthController from '../controllers/healthController';
import { authenticate, requireAdmin } from '../middleware/auth';

/**
 * Router de health checks.
 * Proporciona endpoints para verificar el estado operativo del backend y sus dependencias.
 */
const router = express.Router();

/**
 * GET /health
 * Health check básico
 */
router.get('/', healthController.healthCheck.bind(healthController));

/**
 * GET /health/detailed
 * Health check detallado con estado de todos los servicios
 */
router.get('/detailed', authenticate, requireAdmin, healthController.detailedHealthCheck.bind(healthController));

export default router;
