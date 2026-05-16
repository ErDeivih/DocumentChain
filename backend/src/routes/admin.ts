import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

/**
 * Router de administración del sistema.
 * Gestiona usuarios, estadísticas, pausa de emergencia y sincronización de administradores en blockchain.
 * Todas las rutas requieren autenticación y rol de administrador.
 */
const router = Router();

// Todas las rutas requieren autenticación + rol admin
router.use(authenticate);
router.use(isAdmin);

// Gestión de usuarios

/**
 * GET /admin/users
 * Obtiene el listado completo de usuarios del sistema.
 */
router.get('/users', AdminController.getAllUsers);

/**
 * PUT /admin/users/:userId/role
 * Actualiza el rol de un usuario específico.
 */
router.put('/users/:userId/role', AdminController.updateUserRole);

/**
 * POST /admin/users
 * Crea un nuevo usuario con privilegios de administrador.
 */
router.post('/users', AdminController.createAdminUser);

/**
 * DELETE /admin/users/:userId
 * Elimina un usuario del sistema de forma permanente.
 */
router.delete('/users/:userId', AdminController.deleteUser);

// Estadísticas del sistema

/**
 * GET /admin/stats
 * Devuelve las estadísticas globales del sistema.
 */
router.get('/stats', AdminController.getSystemStats);

export default router;
