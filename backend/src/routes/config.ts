import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { ConfigController } from '../controllers/configController';

/**
 * Router de configuración de contratos y blockchain.
 * Devuelve direcciones de contratos desplegados, ABIs y parámetros de conexión a la red.
 */
const router = Router();

router.use(generalLimiter);

router.get('/contracts', authenticate, ConfigController.getContractsConfig);

export default router;
