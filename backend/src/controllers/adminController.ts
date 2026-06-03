import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import logger from '../utils/logger';

export class AdminController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await AdminService.getAllUsers();
      res.status(200).json({ users });
    } catch (error) {
      logger.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  }

  static async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const updatedUser = await AdminService.updateUserRole(
        req.params.userId as string,
        req.body.role,
        req.user?.userId || ''
      );
      res.status(200).json({ message: 'Rol de usuario actualizado correctamente', user: updatedUser });
    } catch (error) {
      logger.error('Error al actualizar rol de usuario:', error);
      const err = error as any;
      res.status(err.statusCode || 400).json({ error: err.message || 'Error al actualizar el rol del usuario' });
    }
  }

  static async createAdminUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await AdminService.createAdminUser(
        req.body.username, req.body.email, req.body.password, req.body.fullName
      );
      res.status(201).json({
        message: 'Usuario administrador creado correctamente',
        user: result.user,
        recoveryKey: result.recoveryKey
      });
    } catch (error) {
      logger.error('Error al crear usuario admin:', error);
      const err = error as any;
      res.status(err.statusCode || 400).json({ error: err.message || 'Error al crear el usuario administrador' });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      await AdminService.deleteUser(req.params.userId as string, req.user?.userId || '');
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      logger.error('Error al eliminar usuario:', error);
      const err = error as any;
      res.status(err.statusCode || 400).json({ error: err.message || 'Error al eliminar el usuario' });
    }
  }

  static async getSystemStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getSystemStats();
      res.status(200).json({ stats });
    } catch (error) {
      logger.error('Error al obtener estadísticas del sistema:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas del sistema' });
    }
  }
}
