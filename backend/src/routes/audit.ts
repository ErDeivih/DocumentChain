import { Router } from 'express';
import { generalLimiter } from '../middleware/rateLimiter';
import { AuditController } from '../controllers/auditController';
import { z } from 'zod';
import { validateParams } from '../middleware/validator';

const blockchainIdSchema = z.object({ blockchainId: z.string().min(1) });
const fileIdSchema = z.object({ fileId: z.string().min(1) });
const txHashSchema = z.object({ txHash: z.string().min(1) });
const walletAddressSchema = z.object({ walletAddress: z.string().min(1) });

/**
 * Router de auditoría pública.
 * Expone endpoints de transparencia sin autenticación para consultar trazas de auditoría,
 * verificar integridad, propiedad, metadatos públicos, estadísticas y detalles de transacciones.
 */

const router = Router();

router.use(generalLimiter);


router.get('/trail/:blockchainId', validateParams(blockchainIdSchema), AuditController.getAuditTrail);
router.get('/integrity/:fileId', validateParams(fileIdSchema), AuditController.verifyIntegrity);
router.get('/ownership/:blockchainId/:walletAddress', AuditController.verifyOwnership);
router.get('/metadata/:blockchainId', validateParams(blockchainIdSchema), AuditController.getPublicMetadata);
router.get('/transaction/:txHash', validateParams(txHashSchema), AuditController.getTransactionDetails);
router.get('/events', AuditController.queryBlockchainEvents);

export default router;
