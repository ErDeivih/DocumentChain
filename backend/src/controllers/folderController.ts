import { Request, Response } from 'express';
import { FolderService } from '../services/folderService';

function getUserId(req: Request, res: Response): string | null {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return null;
  }
  return req.user.userId;
}

export async function getUserFolders(req: Request, res: Response) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const folders = await FolderService.getUserFolders(userId);
    res.json({ folders });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al obtener carpetas' });
  }
}

export async function getFolderById(req: Request, res: Response) {
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
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al obtener carpeta' });
  }
}

export async function createFolder(req: Request, res: Response) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name, description, parentId, color, icon } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'El nombre de la carpeta es requerido' });
      return;
    }

    const folder = await FolderService.createFolder({
      userId, name: name.trim(), description, parentId, color, icon,
    });
    res.status(201).json({ folder });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al crear carpeta' });
  }
}

export async function updateFolder(req: Request, res: Response) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name, description, color, icon, parentId } = req.body;
    const folder = await FolderService.updateFolder(req.params.id as string, userId, {
      name, description, color, icon, parentId,
    });
    res.json({ folder });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al actualizar carpeta' });
  }
}

export async function deleteFolder(req: Request, res: Response) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    await FolderService.deleteFolder(req.params.id as string, userId, req.query.deleteContents === 'true');
    res.json({ message: 'Carpeta eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al eliminar carpeta' });
  }
}

export async function moveDocumentsToFolder(req: Request, res: Response) {
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
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al mover documentos' });
  }
}

export async function getFolderPath(req: Request, res: Response) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const path = await FolderService.getFolderPath(req.params.id as string, userId);
    res.json({ path });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al obtener ruta de carpeta' });
  }
}

export async function getFolderStats(req: Request, res: Response) {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const stats = await FolderService.getFolderStats(req.params.id as string, userId);
    res.json({ stats });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error al obtener estadísticas' });
  }
}
