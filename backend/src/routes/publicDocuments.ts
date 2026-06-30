import { Router } from 'express';
import { generalLimiter } from '../middleware/rateLimiter';
import { PublicDocumentController } from '../controllers/publicDocumentController';

/**
 * Router de acceso público a documentos.
 * Permite consultar metadatos y descargar contenido de documentos públicos sin autenticación.
 */
const router = Router();


router.get('/:publicId', generalLimiter, PublicDocumentController.getMetadata);
router.get('/:publicId/content', generalLimiter, PublicDocumentController.getContent);
router.get('/:publicId/download', generalLimiter, PublicDocumentController.download);
router.get('/:publicId/versions/:versionNumber/content', generalLimiter, PublicDocumentController.getVersionContent);
router.get('/:publicId/versions/:versionNumber/download', generalLimiter, PublicDocumentController.downloadVersion);

export default router;
