/**
 * Router de línea temporal de documentos.
 * Expone endpoints para consultar el historial cronológico de eventos de un documento.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { validateParams } from '../middleware/validator';
import { TimelineController } from '../controllers/timelineController';

const documentIdSchema = z.object({ id: z.string().min(1) });

const router = Router();

/**
 * GET /timeline/documents/:id
 * Devuelve el historial cronológico de eventos asociados a un documento específico.
 */
router.get('/documents/:id', authenticate, generalLimiter, validateParams(documentIdSchema), TimelineController.getDocumentTimeline);

export default router;