/**
 * Rutas de Línea Temporal de Documentos
 */

import { Router } from 'express';
import { TimelineController } from '../controllers/timelineController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener línea temporal de un documento
router.get('/documents/:id', TimelineController.getDocumentTimeline);

export default router;