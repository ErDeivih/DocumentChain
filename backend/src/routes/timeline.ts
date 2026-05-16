/**
 * Router de línea temporal de documentos.
 * Expone endpoints para consultar el historial cronológico de eventos de un documento.
 */

import { Router } from 'express';
import { TimelineController } from '../controllers/timelineController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener línea temporal de un documento

/**
 * GET /timeline/documents/:id
 * Devuelve el historial cronológico de eventos asociados a un documento específico.
 */
router.get('/documents/:id', TimelineController.getDocumentTimeline);

export default router;