import { Router } from 'express';
import * as folderController from '../controllers/folderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todas las carpetas del usuario
router.get('/', folderController.getUserFolders);

// Obtener una carpeta específica
router.get('/:id', folderController.getFolderById);

// Crear una nueva carpeta
router.post('/', folderController.createFolder);

// Actualizar una carpeta
router.put('/:id', folderController.updateFolder);

// Eliminar una carpeta
router.delete('/:id', folderController.deleteFolder);

// Mover documentos a una carpeta
router.post('/:id/move', folderController.moveDocumentsToFolder);

// Obtener ruta completa de una carpeta (breadcrumb)
router.get('/:id/path', folderController.getFolderPath);

// Obtener estadísticas de una carpeta
router.get('/:id/stats', folderController.getFolderStats);

export default router;
