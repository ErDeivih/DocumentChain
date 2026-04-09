import express from 'express';
import healthController from '../controllers/healthController';

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
router.get('/detailed', healthController.detailedHealthCheck.bind(healthController));

export default router;
