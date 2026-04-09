import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todas las categorías (predefinidas + personalizadas)
router.get('/', categoryController.getCategories);

// Obtener solo categorías predefinidas
router.get('/predefined', categoryController.getPredefinedCategories);

// Obtener solo categorías personalizadas del usuario
router.get('/custom', categoryController.getUserCustomCategories);

// Buscar categorías por nombre
router.get('/search', categoryController.searchCategories);

// Obtener una categoría específica
router.get('/:id', categoryController.getCategoryById);

// Crear una categoría personalizada
router.post('/', categoryController.createCategory);

// Actualizar una categoría personalizada
router.put('/:id', categoryController.updateCategory);

// Eliminar una categoría personalizada
router.delete('/:id', categoryController.deleteCategory);

// Asignar categoría a documentos
router.post('/assign', categoryController.assignCategoryToDocuments);

// Obtener estadísticas de una categoría
router.get('/:id/stats', categoryController.getCategoryStats);

export default router;
