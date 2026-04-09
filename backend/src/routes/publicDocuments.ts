import { Router, Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import logger from '../utils/logger';

const router = Router();

function buildContentDisposition(name: string, inline: boolean): string {
  const safeName = name.replace(/"/g, '');
  return `${inline ? 'inline' : 'attachment'}; filename="${safeName}"`;
}

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