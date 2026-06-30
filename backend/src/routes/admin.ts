import { Router } from 'express';
import { z } from 'zod';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { generalLimiter } from '../middleware/rateLimiter';
import { validateBody, validateParams } from '../middleware/validator';
import { createAdminSchema } from '../schemas/auth.schema';

const updateRoleSchema = z.object({ role: z.enum(['USER', 'ADMIN']) });
const userIdSchema = z.object({ userId: z.string().min(1) });

/**
 * Router de administración del sistema.
 * Gestiona usuarios, estadísticas, pausa de emergencia y sincronización de administradores en blockchain.
 * Todas las rutas requieren autenticación y rol de administrador.
 */
const router = Router();

// Todas las rutas requieren autenticación + rol admin
router.use(authenticate);
router.use(isAdmin);
router.use(generalLimiter);


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
router.put('/users/:userId/role', authenticate, isAdmin, generalLimiter, validateParams(userIdSchema), validateBody(updateRoleSchema), AdminController.updateUserRole);

/**
 * POST /admin/users
 * Crea un nuevo usuario con privilegios de administrador.
 */
router.post('/users', validateBody(createAdminSchema), AdminController.createAdminUser);

/**
 * DELETE /admin/users/:userId
 * Elimina un usuario del sistema de forma permanente.
 */
router.delete('/users/:userId', authenticate, isAdmin, generalLimiter, validateParams(userIdSchema), AdminController.deleteUser);

// Estadísticas del sistema

/**
 * GET /admin/stats
 * Devuelve las estadísticas globales del sistema.
 */
router.get('/stats', AdminController.getSystemStats);

export default router;
