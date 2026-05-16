import { Router } from 'express';
import { VersionController } from '../controllers/versionController';
import { SignatureController } from '../controllers/signatureController';
import { authenticate } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';

/**
 * Router de gestión de versiones de documentos.
 * Permite consultar, descargar, revertir y restaurar versiones, así como gestionar firmas por versión.
 */
const router = Router();

// Version routes

/**
 * GET /versions/:versionId
 * Devuelve los metadatos de una versión específica de documento.
 */
router.get('/:versionId', authenticate, VersionController.getVersion);

/**
 * GET /versions/:versionId/download
 * Permite la descarga del contenido de una versión específica de documento.
 */
router.get('/:versionId/download', authenticate, VersionController.downloadVersion);

// Rollback routes

/**
 * POST /versions/:versionId/rollback
 * Prepara el rollback del documento a la versión especificada.
 */
router.post('/:versionId/rollback', authenticate, generalLimiter, VersionController.rollbackVersion);

/**
 * POST /versions/:versionId/rollback-restore
 * Restaura el documento a una versión anterior tras el proceso de rollback.
 */
router.post('/:versionId/rollback-restore', authenticate, generalLimiter, VersionController.rollbackVersionRestore);

// Restore confirm (after blockchain transaction for a restore prepare)

/**
 * POST /versions/:versionId/restore/confirm
 * Confirma la restauración de una versión tras completar la transacción en blockchain.
 */
router.post('/:versionId/restore/confirm', authenticate, generalLimiter, VersionController.confirmRestoreVersion);

// Version signature routes

/**
 * GET /versions/:versionId/signatures
 * Obtiene todas las firmas criptográficas asociadas a una versión específica.
 */
router.get('/:versionId/signatures', authenticate, SignatureController.getVersionSignatures);

/**
 * GET /versions/:versionId/signatures/check
 * Verifica si una versión específica cuenta con firma criptográfica válida.
 */
router.get('/:versionId/signatures/check', authenticate, SignatureController.checkSignature);

/**
 * GET /versions/:versionId/signatures/me
 * Devuelve la firma criptográfica del usuario autenticado para una versión específica.
 */
router.get('/:versionId/signatures/me', authenticate, SignatureController.getMySignature);

export default router;
