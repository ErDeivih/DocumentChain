import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { validateBody, validateParams, validateQuery } from '../middleware/validator';
import { updateProfileSchema, userIdSchema, searchUsersSchema } from '../schemas/user.schema';

/**
 * Router de gestión de usuarios.
 * Expone endpoints para perfiles, avatares, búsqueda, suspensión y administración de cuentas.
 */
const router = Router();

router.use(generalLimiter);

// Protected routes (require authentication)

/**
 * GET /users/profile
 * Devuelve el perfil completo del usuario autenticado.
 */
router.get('/profile', authenticate, UserController.getProfile);

/**
 * PUT /users/profile
 * Actualiza los datos de perfil del usuario autenticado.
 */
router.put('/profile', authenticate, validateBody(updateProfileSchema), UserController.updateProfile);

/**
 * DELETE /users/me
 * Elimina la cuenta del usuario autenticado de forma permanente.
 */
router.delete('/me', authenticate, UserController.deleteMyAccount);

/**
 * GET /users/search
 * Busca usuarios por término de búsqueda con paginación y filtros.
 */
router.get('/search', authenticate, validateQuery(searchUsersSchema), UserController.searchUsers);

/**
 * GET /users/:userId
 * Obtiene el perfil de un usuario específico por su identificador.
 */
router.get('/:userId', authenticate, validateParams(userIdSchema), UserController.getUserById);

// Admin only routes

/**
 * GET /users
 * Devuelve el listado completo de usuarios del sistema. Requiere rol de administrador.
 */
router.get('/', authenticate, requireAdmin, UserController.getAllUsers);

/**
 * DELETE /users/:userId
 * Elimina un usuario específico del sistema. Requiere rol de administrador.
 */
router.delete('/:userId', authenticate, requireAdmin, validateParams(userIdSchema), UserController.deleteUser);

export default router;
