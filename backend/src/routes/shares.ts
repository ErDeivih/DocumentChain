import { Router } from 'express';
import { ShareController } from '../controllers/shareController';
import { authenticate } from '../middleware/auth';
import { shareLimiter } from '../middleware/rateLimiter';

/**
 * Router de gestión de comparticiones.
 * Expone endpoints para consultar documentos compartidos y confirmar comparticiones o revocaciones.
 */
const router = Router();

// All share routes require authentication

/**
 * GET /shares/with-me
 * Obtiene el listado de documentos que han sido compartidos con el usuario autenticado.
 */
router.get('/with-me', authenticate, ShareController.getSharedWithMe);

// Confirm share creation (shareId in body identifies the record — no documentId in URL needed)

/**
 * POST /shares/confirm
 * Confirma la creación de una compartición utilizando el shareId proporcionado en el cuerpo de la petición.
 */
router.post('/confirm', authenticate, shareLimiter, ShareController.confirmShare);

// Confirm share revocation (shareId in body identifies the record — no documentId/userId in URL needed)

/**
 * POST /shares/revoke/confirm
 * Confirma la revocación de una compartición utilizando el shareId proporcionado en el cuerpo de la petición.
 */
router.post('/revoke/confirm', authenticate, shareLimiter, ShareController.confirmRevokeShare);

export default router;
