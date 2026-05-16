import { Router } from 'express';
import * as folderController from '../controllers/folderController';
import { authenticate } from '../middleware/auth';

/**
 * Router de gestión de carpetas.
 * Permite crear, consultar, actualizar, eliminar y organizar carpetas jerárquicas de documentos.
 */
const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todas las carpetas del usuario

/**
 * GET /folders
 * Devuelve todas las carpetas pertenecientes al usuario autenticado.
 */
router.get('/', folderController.getUserFolders);

// Obtener una carpeta específica

/**
 * GET /folders/:id
 * Devuelve los detalles de una carpeta específica por su identificador.
 */
router.get('/:id', folderController.getFolderById);

// Crear una nueva carpeta

/**
 * POST /folders
 * Crea una nueva carpeta jerárquica para el usuario autenticado.
 */
router.post('/', folderController.createFolder);

// Actualizar una carpeta

/**
 * PUT /folders/:id
 * Actualiza el nombre o la configuración de una carpeta existente.
 */
router.put('/:id', folderController.updateFolder);

// Eliminar una carpeta

/**
 * DELETE /folders/:id
 * Elimina una carpeta y, opcionalmente, su contenido asociado.
 */
router.delete('/:id', folderController.deleteFolder);

// Mover documentos a una carpeta

/**
 * POST /folders/:id/move
 * Mueve uno o varios documentos a la carpeta especificada.
 */
router.post('/:id/move', folderController.moveDocumentsToFolder);

// Obtener ruta completa de una carpeta (breadcrumb)

/**
 * GET /folders/:id/path
 * Devuelve la ruta jerárquica completa (breadcrumb) de una carpeta.
 */
router.get('/:id/path', folderController.getFolderPath);

// Obtener estadísticas de una carpeta

/**
 * GET /folders/:id/stats
 * Devuelve estadísticas agregadas de los documentos contenidos en una carpeta.
 */
router.get('/:id/stats', folderController.getFolderStats);

export default router;
