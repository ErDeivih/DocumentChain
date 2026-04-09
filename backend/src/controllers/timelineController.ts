/**
 * Controlador de Línea Temporal de Documentos
 */

import { Request, Response } from 'express';
import { DocumentTimelineService } from '../services/documentTimelineService';
import logger from '../utils/logger';

export class TimelineController {
  /**
   * Obtener la línea temporal de un documento
   * GET /api/documents/:id/timeline
   */
  static async getDocumentTimeline(req: Request, res: Response): Promise<void> {
    try {
      const documentId = req.params.id as string;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const timeline = await DocumentTimelineService.getDocumentTimeline(documentId, userId);

      res.json(timeline);
    } catch (error) {
      logger.error('Error al obtener línea temporal del documento', {
        documentId: req.params.id,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error instanceof Error && error.message.includes('permiso')) {
        res.status(403).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Error al obtener línea temporal' });
    }
  }
}
