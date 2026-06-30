import { Router } from 'express';
import { VersionController } from '../controllers/versionController';
import { authenticate } from '../middleware/auth';
import { generalLimiter, confirmLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { validateBody, validateParams } from '../middleware/validator';

const versionIdSchema = z.object({ versionId: z.string().min(1) });

const rollbackRestoreSchema = z.object({});

const confirmRestoreVersionSchema = z.object({
  txHash: z.string(),
});

/**
 * Router de gestión de versiones de documentos.
 * Permite consultar, descargar, revertir y restaurar versiones, así como gestionar firmas por versión.
 */
const router = Router();

router.use(generalLimiter);


// Version routes

/**
 * GET /versions/:versionId
 * Devuelve los metadatos de una versión específica de documento.
 */
router.get('/:versionId', authenticate, validateParams(versionIdSchema), VersionController.getVersion);

/**
 * GET /versions/:versionId/download
 * Permite la descarga del contenido de una versión específica de documento.
 */
router.get('/:versionId/download', authenticate, validateParams(versionIdSchema), VersionController.downloadVersion);

// Rollback routes

/**
 * POST /versions/:versionId/rollback
 * Prepara el rollback del documento a la versión especificada.
 */
router.post('/:versionId/rollback', authenticate, generalLimiter, validateParams(versionIdSchema), VersionController.rollbackVersion);

/**
 * POST /versions/:versionId/rollback-restore
 * Restaura el documento a una versión anterior tras el proceso de rollback.
 */
router.post('/:versionId/rollback-restore', authenticate, generalLimiter, validateParams(versionIdSchema), validateBody(rollbackRestoreSchema), VersionController.rollbackVersionRestore);

// Restore confirm (after blockchain transaction for a restore prepare)

/**
 * POST /versions/:versionId/restore/confirm
 * Confirma la restauración de una versión tras completar la transacción en blockchain.
 */
router.post('/:versionId/restore/confirm', authenticate, confirmLimiter, validateParams(versionIdSchema), validateBody(confirmRestoreVersionSchema), VersionController.confirmRestoreVersion);

export default router;
