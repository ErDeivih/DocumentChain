import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';
import { SuspensionFlowError, UserSuspensionService } from '../services/userSuspensionService';

export class UserController {
  /**
   * Obtener perfil del usuario actual
   * GET /api/users/profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const user = await UserService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Actualizar perfil del usuario actual
   * PUT /api/users/profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { email, fullName } = req.body;

      const user = await UserService.updateProfile(req.user.userId, {
        email,
        fullName
      });

      res.status(200).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener usuario por nombre de usuario (para buscar al compartir)
   * GET /api/users/username/:username
   */
  static async getUserByUsername(req: Request, res: Response): Promise<void> {
    try {
      const username = req.params.username as string;

      const user = await UserService.getUserByUsername(username);

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Devolver información limitada por privacidad
      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener usuario por ID
   * GET /api/users/:userId
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;

      const user = await UserService.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Buscar usuarios por nombre de usuario
   * GET /api/users/search?q=username
   */
  static async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q, query, limit } = req.query;
      const searchTerm = typeof q === 'string' ? q : typeof query === 'string' ? query : undefined;

      if (!searchTerm) {
        res.status(400).json({ error: 'El parámetro de búsqueda "q" es obligatorio' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string) : 10;

      const users = await UserService.searchUsers(searchTerm, limitNum);

      res.status(200).json({ users });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener todos los usuarios (solo admin)
   * GET /api/users?page=1&limit=50
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = req.query;

      const pageNum = page ? parseInt(page as string) : 1;
      const limitNum = limit ? parseInt(limit as string) : 50;

      const result = await UserService.getAllUsers(pageNum, limitNum);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Eliminar usuario (solo admin)
   * DELETE /api/users/:userId
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;

      await UserService.deleteUser(userId);

      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async prepareSuspendMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { reason } = req.body;

      const preparation = await UserSuspensionService.prepareSuspend(userId, reason);

      res.status(200).json(preparation);
    } catch (error: any) {
      UserController.handleSuspensionError(res, error, 'Error al preparar la suspensión');
    }
  }

  static async confirmSuspendMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const accessToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.substring(7)
        : undefined;

      const result = await UserSuspensionService.confirmSuspend(userId, {
        txHash: req.body?.txHash,
        reason: req.body?.reason,
        currentAccessToken: accessToken,
      });

      res.status(200).json({
        success: true,
        message: 'Tu cuenta ha quedado suspendida a nivel de blockchain y aplicación.',
        txHash: result.txHash,
        user: result.user,
      });
    } catch (error: any) {
      UserController.handleSuspensionError(res, error, 'Error al confirmar la suspensión');
    }
  }

  static async prepareUnsuspendMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const preparation = await UserSuspensionService.prepareUnsuspend(userId);

      res.status(200).json(preparation);
    } catch (error: any) {
      UserController.handleSuspensionError(res, error, 'Error al preparar la reactivación');
    }
  }

  static async confirmUnsuspendMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const result = await UserSuspensionService.confirmUnsuspend(userId, {
        txHash: req.body?.txHash,
      });

      res.status(200).json({
        success: true,
        message: 'Tu cuenta ha sido reactivada.',
        txHash: result.txHash,
        user: result.user,
      });
    } catch (error: any) {
      UserController.handleSuspensionError(res, error, 'Error al confirmar la reactivación');
    }
  }

  private static handleSuspensionError(res: Response, error: any, fallbackMessage: string): void {
    if (error instanceof SuspensionFlowError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    logger.error(fallbackMessage, error);
    res.status(500).json({ error: fallbackMessage });
  }
}
