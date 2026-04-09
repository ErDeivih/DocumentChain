import { Request, Response } from 'express';
import { StatsService } from '../services/statsService';

export class StatsController {
  /**
   * Obtener estadísticas del usuario actual
   * GET /api/stats/me
   */
  static async getMyStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const stats = await StatsService.getUserStats(req.user.userId);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener estadísticas del sistema (solo admin)
   * GET /api/stats/system
   */
  static async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await StatsService.getSystemStats();

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener estadísticas de documento
   * GET /api/documents/:documentId/stats
   */
  static async getDocumentStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const documentId = req.params.documentId as string;

      const stats = await StatsService.getDocumentStats(
        documentId,
        req.user.userId
      );

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener documentos principales por métrica (solo admin)
   * GET /api/stats/top-documents?metric=size&limit=10
   */
  static async getTopDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { metric, limit } = req.query;

      if (!metric || typeof metric !== 'string') {
        res.status(400).json({ error: 'Se requiere la métrica' });
        return;
      }

      const validMetrics = ['size', 'versions', 'signatures', 'shares'];
      if (!validMetrics.includes(metric)) {
        res.status(400).json({ 
          error: 'Métrica inválida. Debe ser una de: size, versions, signatures, shares' 
        });
        return;
      }

      const limitNum = limit ? parseInt(limit as string) : 10;

      const documents = await StatsService.getTopDocuments(
        metric as any,
        limitNum
      );

      res.status(200).json({ documents });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener estadísticas de usuario por ID (solo admin)
   * GET /api/stats/user/:userId
   */
  static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;

      const stats = await StatsService.getUserStats(userId);

      res.status(200).json({ stats });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
