import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import logger from '../utils/logger';

/**
 * Controlador de administración. Gestiona usuarios, roles y estadísticas del sistema.
 */
export class AdminController {

  /**
   * Obtiene todos los usuarios del sistema (solo administradores).
   * Endpoint: GET /api/admin/users
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await AdminService.getAllUsers();
      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el rol de un usuario (solo administradores).
   * Endpoint: PUT /api/admin/users/:userId/role
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await AdminService.updateUserRole(
        req.params.userId as string,
        req.body.role,
        req.user?.userId || ''
      );
      res.status(200).json({ message: 'Rol de usuario actualizado correctamente', user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo usuario administrador (solo administradores).
   * Endpoint: POST /api/admin/users
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async createAdminUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.createAdminUser(req.body);
      res.status(201).json({
        message: 'Usuario administrador creado correctamente',
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un usuario del sistema (solo administradores).
   * Endpoint: DELETE /api/admin/users/:userId
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AdminService.deleteUser(req.params.userId as string, req.user?.userId || '');
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas generales del sistema (solo administradores).
   * Endpoint: GET /api/admin/stats
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async getSystemStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getSystemStats();
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  }
}
