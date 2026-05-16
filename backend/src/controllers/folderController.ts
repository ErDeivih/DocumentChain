import { Request, Response } from 'express';
import { FolderService } from '../services/folderService';

/**
 * Controlador de carpetas.
 * Gestiona la creación, consulta, actualización, eliminación y organización
 * de carpetas pertenecientes a los usuarios.
 */

/**
 * Obtiene todas las carpetas del usuario autenticado.
 * Endpoint: GET /api/folders
 *
 * @param req - Objeto de solicitud HTTP autenticado.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la lista de carpetas.
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
 * Obtiene una carpeta específica por su identificador.
 * Endpoint: GET /api/folders/:id
 *
 * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la carpeta.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con los datos de la carpeta.
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
 * Crea una nueva carpeta para el usuario autenticado.
 * Endpoint: POST /api/folders
 *
 * @param req - Objeto de solicitud HTTP autenticado con { name, description?, parentId?, color?, icon? }.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la carpeta creada.
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
 * Actualiza los datos de una carpeta existente.
 * Endpoint: PUT /api/folders/:id
 *
 * @param req - Objeto de solicitud HTTP autenticado con los campos a actualizar.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la carpeta actualizada.
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
 * Elimina una carpeta y opcionalmente su contenido.
 * Endpoint: DELETE /api/folders/:id
 *
 * @param req - Objeto de solicitud HTTP autenticado. La query puede incluir deleteContents.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la confirmación de eliminación.
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
 * Mueve uno o varios documentos a una carpeta determinada.
 * Endpoint: POST /api/folders/:id/move
 *
 * @param req - Objeto de solicitud HTTP autenticado con { documentIds: string[] }.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la confirmación del movimiento.
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
 * Obtiene la ruta completa (breadcrumb) de una carpeta.
 * Endpoint: GET /api/folders/:id/path
 *
 * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la carpeta.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con la jerarquía de carpetas.
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
 * Obtiene las estadísticas de una carpeta específica.
 * Endpoint: GET /api/folders/:id/stats
 *
 * @param req - Objeto de solicitud HTTP autenticado. Los parámetros deben incluir el ID de la carpeta.
 * @param res - Objeto de respuesta HTTP.
 * @returns Promesa que resuelve con las estadísticas de la carpeta.
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
