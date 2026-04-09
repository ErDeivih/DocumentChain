import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireAdmin, authenticateEvenIfSuspended } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validator';
import { updateProfileSchema, userIdSchema, usernameSchema, searchUsersSchema } from '../schemas/user.schema';

const router = Router();

// Protected routes (require authentication)
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validateBody(updateProfileSchema), UserController.updateProfile);
router.post('/me/suspend/prepare', authenticate, UserController.prepareSuspendMe);
router.post('/me/suspend/confirm', authenticateEvenIfSuspended, UserController.confirmSuspendMe);
router.post('/me/unsuspend/prepare', authenticateEvenIfSuspended, UserController.prepareUnsuspendMe);
router.post('/me/unsuspend/confirm', authenticateEvenIfSuspended, UserController.confirmUnsuspendMe);
router.get('/search', authenticate, validateQuery(searchUsersSchema), UserController.searchUsers);
router.get('/username/:username', authenticate, validateParams(usernameSchema), UserController.getUserByUsername);
router.get('/:userId', authenticate, validateParams(userIdSchema), UserController.getUserById);

// Admin only routes
router.get('/', authenticate, requireAdmin, UserController.getAllUsers);
router.delete('/:userId', authenticate, requireAdmin, validateParams(userIdSchema), UserController.deleteUser);

export default router;
