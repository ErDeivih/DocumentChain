import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

// Todas las rutas requieren autenticación + rol admin
router.use(authenticate);
router.use(isAdmin);

// Gestión de usuarios
router.get('/users', AdminController.getAllUsers);
router.put('/users/:userId/role', AdminController.updateUserRole);
router.post('/users', AdminController.createAdminUser);
router.delete('/users/:userId', AdminController.deleteUser);

// Estadísticas del sistema
router.get('/stats', AdminController.getSystemStats);

// Sistema de pausa de emergencia (Circuit Breaker)
router.get('/system/status', AdminController.getSystemStatus);
router.post('/system/pause', AdminController.pauseSystem);
router.post('/system/unpause', AdminController.unpauseSystem);

// Sincronización de administradores con blockchain
router.post('/sync/admins', AdminController.syncAdminsToBlockchain);

export default router;
