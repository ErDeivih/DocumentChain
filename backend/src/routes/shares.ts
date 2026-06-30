import { Router } from 'express';
import { ShareController } from '../controllers/shareController';
import { authenticate } from '../middleware/auth';
import { generalLimiter, shareLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { validateBody, validateParams } from '../middleware/validator';

const shareIdSchema = z.object({ shareId: z.string().min(1) });

const confirmShareSchema = z.object({ shareId: z.string(), txHash: z.string(), documentId: z.string().optional() });
const confirmRevokeShareSchema = z.object({ shareId: z.string(), txHash: z.string() });

/**
 * Router de gestión de comparticiones.
 * Expone endpoints para consultar documentos compartidos y confirmar comparticiones o revocaciones.
 */
const router = Router();

router.use(generalLimiter);

// Todas las rutas de compartición requieren autenticación

/**
 * GET /shares/with-me
 * Obtiene el listado de documentos que han sido compartidos con el usuario autenticado.
 */
router.get('/with-me', authenticate, ShareController.getSharedWithMe);

// Confirmar creación de compartición (shareId en el body identifica el registro — no documentId in URL needed)

/**
 * POST /shares/confirm
 * Confirma la creación de una compartición utilizando el shareId proporcionado en el cuerpo de la petición.
 */
router.post('/confirm', authenticate, shareLimiter, validateBody(confirmShareSchema), ShareController.confirmShare);

// Confirmar revocación de compartición (shareId en el body identifica el registro — no documentId/userId in URL needed)

/**
 * POST /shares/revoke/confirm
 * Confirma la revocación de una compartición utilizando el shareId proporcionado en el cuerpo de la petición.
 */
router.post('/revoke/confirm', authenticate, shareLimiter, validateBody(confirmRevokeShareSchema), ShareController.confirmRevokeShare);

/**
 * POST /shares/:shareId/rollback-revoke
 * Revierte una compartición PREPARING si la transacción blockchain falló.
 */
router.post('/:shareId/rollback-revoke', authenticate, validateParams(shareIdSchema), ShareController.rollbackRevoke);

export default router;
