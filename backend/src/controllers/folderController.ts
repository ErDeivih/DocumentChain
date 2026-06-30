import { Request, Response, NextFunction } from 'express';
import { FolderService } from '../services/folderService';

function getUserId(req: Request, res: Response): string | null {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return null;
  }
  return req.user.userId;
}

/**
 * Obtiene las carpetas del usuario autenticado.
 * Endpoint: GET /api/folders
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export async function getUserFolders(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const folders = await FolderService.getUserFolders(userId);
    res.json({ folders });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene una carpeta por su ID.
 * Endpoint: GET /api/folders/:id
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export async function getFolderById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const folder = await FolderService.getFolderById(req.params.id as string, userId);
    if (!folder) {
      res.status(404).json({ error: 'Carpeta no encontrada' });
      return;
    }
    res.json({ folder });
  } catch (error) {
    next(error);
  }
}

/**
 * Crea una nueva carpeta.
 * Endpoint: POST /api/folders
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export async function createFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name, description, parentId, color } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'El nombre de la carpeta es requerido' });
      return;
    }

    const folder = await FolderService.createFolder({
      userId, name: name.trim(), description, parentId, color,
    });
    res.status(201).json({ folder });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza los datos de una carpeta existente.
 * Endpoint: PUT /api/folders/:id
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export async function updateFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name, description, color, parentId } = req.body;
    const folder = await FolderService.updateFolder(req.params.id as string, userId, {
      name, description, color, parentId,
    });
    res.json({ folder });
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina una carpeta y opcionalmente su contenido.
 * Endpoint: DELETE /api/folders/:id
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export async function deleteFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    await FolderService.deleteFolder(req.params.id as string, userId, req.query.orphanContents === 'true');
    res.json({ message: 'Carpeta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
}

/**
 * Mueve documentos a una carpeta específica.
 * Endpoint: POST /api/folders/:id/move-documents
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export async function moveDocumentsToFolder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { documentIds } = req.body;
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(400).json({ error: 'Se requiere un array de IDs de documentos' });
      return;
    }

    const folderId = req.params.id === 'root' ? null : (req.params.id as string);
    await FolderService.moveDocumentsToFolder(documentIds, folderId, userId);
    res.json({ message: 'Documentos movidos exitosamente' });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene la ruta jerárquica de una carpeta hasta la raíz.
 * Endpoint: GET /api/folders/:id/path
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<void>}
 */
export async function getFolderPath(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const path = await FolderService.getFolderPath(req.params.id as string, userId);
    res.json({ path });
  } catch (error) {
    next(error);
  }
}
