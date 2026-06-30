import { Router } from 'express';
import { z } from 'zod';
import * as folderController from '../controllers/folderController';
import { authenticate } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { validateBody, validateParams } from '../middleware/validator';

const folderIdSchema = z.object({ id: z.string().min(1) });

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().uuid().optional(),
});
const updateFolderSchema = z.object({
  name: z.string().min(1).optional(),
});
const moveDocumentsSchema = z.object({
  documentIds: z.array(z.string().refine((v) => /^[a-zA-Z0-9_-]+$/.test(v), 'ID de documento inválido')).min(1, 'Se requiere al menos un documento'),
});

/**
 * Router de gestión de carpetas.
 * Permite crear, consultar, actualizar, eliminar y organizar carpetas jerárquicas de documentos.
 */
const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);
router.use(generalLimiter);


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
router.get('/:id', validateParams(folderIdSchema), folderController.getFolderById);

// Crear una nueva carpeta

/**
 * POST /folders
 * Crea una nueva carpeta jerárquica para el usuario autenticado.
 */
router.post('/', validateBody(createFolderSchema), folderController.createFolder);

// Actualizar una carpeta

/**
 * PUT /folders/:id
 * Actualiza el nombre o la configuración de una carpeta existente.
 */
router.put('/:id', validateParams(folderIdSchema), validateBody(updateFolderSchema), folderController.updateFolder);

// Eliminar una carpeta

/**
 * DELETE /folders/:id
 * Elimina una carpeta y, opcionalmente, su contenido asociado.
 */
router.delete('/:id', validateParams(folderIdSchema), folderController.deleteFolder);

// Mover documentos a una carpeta

/**
 * POST /folders/:id/move
 * Mueve uno o varios documentos a la carpeta especificada.
 */
router.post('/:id/move', validateParams(folderIdSchema), validateBody(moveDocumentsSchema), folderController.moveDocumentsToFolder);

// Obtener ruta completa de una carpeta (breadcrumb)

/**
 * GET /folders/:id/path
 * Devuelve la ruta jerárquica completa (breadcrumb) de una carpeta.
 */
router.get('/:id/path', validateParams(folderIdSchema), folderController.getFolderPath);

export default router;
