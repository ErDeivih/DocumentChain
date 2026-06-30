import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/documentService';
import logger from '../utils/logger';
import { buildAttachmentDisposition } from '../utils/httpHeaders';

function buildContentDisposition(name: string, inline: boolean): string {
  return buildAttachmentDisposition(name, inline);
}

/**
 * Controlador de documentos públicos. Acceso sin autenticación a documentos publicados.
 */
export class PublicDocumentController {

  /**
   * Obtiene los metadatos de un documento público por su ID público.
   * Endpoint: GET /api/public/documents/:publicId/metadata
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = String(req.params.publicId);
      const document = await DocumentService.getPublicDocumentByPublicId(publicId);

      if (!document) {
        res.status(404).json({ error: 'Documento público no encontrado' });
        return;
      }

      res.json({ document });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el contenido de un documento público para visualización inline.
   * Endpoint: GET /api/public/documents/:publicId/content
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = String(req.params.publicId);
      const result = await DocumentService.downloadPublicDocumentByPublicId(publicId);
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', buildContentDisposition(result.name, true));
      res.send(result.file);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descarga un documento público como archivo adjunto.
   * Endpoint: GET /api/public/documents/:publicId/download
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = String(req.params.publicId);
      const result = await DocumentService.downloadPublicDocumentByPublicId(publicId);
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', buildContentDisposition(result.name, false));
      res.send(result.file);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene el contenido de una versión específica de un documento público (inline).
   * Endpoint: GET /api/public/documents/:publicId/versions/:versionNumber/content
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getVersionContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = String(req.params.publicId);
      const versionNumber = Number(req.params.versionNumber);
      const result = await DocumentService.downloadPublicDocumentByPublicId(publicId, versionNumber);
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', buildContentDisposition(result.name, true));
      res.send(result.file);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Descarga una versión específica de un documento público como adjunto.
   * Endpoint: GET /api/public/documents/:publicId/versions/:versionNumber/download
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async downloadVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = String(req.params.publicId);
      const versionNumber = Number(req.params.versionNumber);
      const result = await DocumentService.downloadPublicDocumentByPublicId(publicId, versionNumber);
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', buildContentDisposition(result.name, false));
      res.send(result.file);
    } catch (error) {
      next(error);
    }
  }
}
