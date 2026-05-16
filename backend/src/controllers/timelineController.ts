/**
 * Controlador de línea temporal de documentos.
 * Gestiona la obtención del historial cronológico de eventos asociados
 * a un documento específico.
 */
import { Request, Response } from 'express';
import { DocumentTimelineService } from '../services/documentTimelineService';
import logger from '../utils/logger';

export class TimelineController {
  /**
   * Obtiene la línea temporal de eventos de un documento.
   * Endpoint: GET /api/documents/:id/timeline
   *
   * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID del documento.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la línea temporal del documento.
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
