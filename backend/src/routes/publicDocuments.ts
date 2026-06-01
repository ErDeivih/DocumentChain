import { Router, Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import logger from '../utils/logger';
import { buildAttachmentDisposition } from '../utils/httpHeaders';

/**
 * Router de acceso público a documentos.
 * Permite consultar metadatos y descargar contenido de documentos públicos sin autenticación.
 */
const router = Router();

/**
 * Construye el valor del encabezado HTTP `Content-Disposition` a partir del nombre del archivo.
 *
 * @param name - Nombre del archivo.
 * @param inline - Si es `true`, se usa `inline`; de lo contrario, `attachment`.
 * @returns Cadena formateada para el encabezado `Content-Disposition`.
 */
function buildContentDisposition(name: string, inline: boolean): string {
  return buildAttachmentDisposition(name, inline);
}

/**
 * GET /:publicId
 * Obtiene los metadatos de un documento público mediante su identificador público.
 */
router.get('/:publicId', async (req: Request, res: Response) => {
  try {
    const publicId = String(req.params.publicId);
    const document = await DocumentService.getPublicDocumentByPublicId(publicId);

    if (!document) {
      return res.status(404).json({ error: 'Documento público no encontrado' });
    }

    res.json({ document });
  } catch (error) {
    logger.error('Error al recuperar documento público', { error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al recuperar documento público' });
  }
});

/**
 * GET /:publicId/content
 * Devuelve el contenido de un documento público para visualización inline.
 */
router.get('/:publicId/content', async (req: Request, res: Response) => {
  try {
    const publicId = String(req.params.publicId);
    const result = await DocumentService.downloadPublicDocumentByPublicId(publicId);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', buildContentDisposition(result.name, true));
    res.send(result.file);
  } catch (error) {
    logger.error('Error al recuperar contenido público', { error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al recuperar contenido público' });
  }
});

/**
 * GET /:publicId/download
 * Descarga el contenido de un documento público como archivo adjunto.
 */
router.get('/:publicId/download', async (req: Request, res: Response) => {
  try {
    const publicId = String(req.params.publicId);
    const result = await DocumentService.downloadPublicDocumentByPublicId(publicId);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', buildContentDisposition(result.name, false));
    res.send(result.file);
  } catch (error) {
    logger.error('Error al descargar documento público', { error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al descargar documento público' });
  }
});

/**
 * GET /:publicId/versions/:versionNumber/content
 * Devuelve el contenido de una versión específica de un documento público para visualización inline.
 */
router.get('/:publicId/versions/:versionNumber/content', async (req: Request, res: Response) => {
  try {
    const publicId = String(req.params.publicId);
    const versionNumber = Number(req.params.versionNumber);
    const result = await DocumentService.downloadPublicDocumentByPublicId(publicId, versionNumber);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', buildContentDisposition(result.name, true));
    res.send(result.file);
  } catch (error) {
    logger.error('Error al recuperar versión pública', { error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al recuperar versión pública' });
  }
});

/**
 * GET /:publicId/versions/:versionNumber/download
 * Descarga el contenido de una versión específica de un documento público como archivo adjunto.
 */
router.get('/:publicId/versions/:versionNumber/download', async (req: Request, res: Response) => {
  try {
    const publicId = String(req.params.publicId);
    const versionNumber = Number(req.params.versionNumber);
    const result = await DocumentService.downloadPublicDocumentByPublicId(publicId, versionNumber);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', buildContentDisposition(result.name, false));
    res.send(result.file);
  } catch (error) {
    logger.error('Error al descargar versión pública', { error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al descargar versión pública' });
  }
});

export default router;
