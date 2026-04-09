import { Request, Response } from 'express';
import { FolderService } from '../services/folderService';

/**
 * GET /api/folders
 * Obtener todas las carpetas del usuario
 */
export async function getUserFolders(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const folders = await FolderService.getUserFolders(userId);
    
    res.json({
      success: true,
      folders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener carpetas',
    });
  }
}

/**
 * GET /api/folders/:id
 * Obtener una carpeta por ID
 */
export async function getFolderById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    
    const folder = await FolderService.getFolderById(id, userId);
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Carpeta no encontrada',
      });
    }
    
    res.json({
      success: true,
      folder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener carpeta',
    });
  }
}

/**
 * POST /api/folders
 * Crear una nueva carpeta
 */
export async function createFolder(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name, description, parentId, color, icon } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la carpeta es requerido',
      });
    }
    
    const folder = await FolderService.createFolder({
      userId,
      name: name.trim(),
      description,
      parentId,
      color,
      icon,
    });
    
    res.status(201).json({
      success: true,
      folder,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear carpeta',
    });
  }
}

/**
 * PUT /api/folders/:id
 * Actualizar una carpeta
 */
export async function updateFolder(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { name, description, color, icon, parentId } = req.body;
    
    const folder = await FolderService.updateFolder(id, userId, {
      name,
      description,
      color,
      icon,
      parentId,
    });
    
    res.json({
      success: true,
      folder,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar carpeta',
    });
  }
}

/**
 * DELETE /api/folders/:id
 * Eliminar una carpeta
 */
export async function deleteFolder(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { deleteContents } = req.query;
    
    await FolderService.deleteFolder(
      id,
      userId,
      deleteContents === 'true'
    );
    
    res.json({
      success: true,
      message: 'Carpeta eliminada exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar carpeta',
    });
  }
}

/**
 * POST /api/folders/:id/move
 * Mover documentos a una carpeta
 */
export async function moveDocumentsToFolder(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const { documentIds } = req.body;
    
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de IDs de documentos',
      });
    }
    
    const folderId = id === 'root' ? null : id;
    
    await FolderService.moveDocumentsToFolder(documentIds, folderId, userId);
    
    res.json({
      success: true,
      message: 'Documentos movidos exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al mover documentos',
    });
  }
}

/**
 * GET /api/folders/:id/path
 * Obtener la ruta completa de una carpeta (breadcrumb)
 */
export async function getFolderPath(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    
    const path = await FolderService.getFolderPath(id, userId);
    
    res.json({
      success: true,
      path,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener ruta de carpeta',
    });
  }
}

/**
 * GET /api/folders/:id/stats
 * Obtener estadísticas de una carpeta
 */
export async function getFolderStats(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    
    const stats = await FolderService.getFolderStats(id, userId);
    
    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener estadísticas',
    });
  }
}
