import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import logger from '../utils/logger';


/**
 * Controlador de usuarios.
 * Gestiona el perfil, búsqueda, eliminación y avatar,
 * eliminación de cuenta de los usuarios del sistema.
 */
export class UserController {
  /**
   * Obtiene el perfil completo del usuario autenticado.
   * Endpoint: GET /api/users/profile
   *
   * @param req - Objeto de solicitud HTTP autenticado.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos del perfil.
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * Endpoint: PUT /api/users/profile
   *
   * @param req - Objeto de solicitud HTTP autenticado con { email?, fullName? } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el perfil actualizado.
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene un usuario por su identificador único.
   * Endpoint: GET /api/users/:userId
   *
   * @param req - Objeto de solicitud HTTP. Los parámetros deben incluir el ID del usuario.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos del usuario.
   */
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const userId = req.params.userId as string;

      const isSelf = req.user.userId === userId;

      if (isSelf) {
        const user = await UserService.getUserById(userId);
        if (!user) {
          res.status(404).json({ error: 'Usuario no encontrado' });
          return;
        }
        res.status(200).json({ user });
      } else {
        const user = await UserService.getUserPublicProfile(userId);
        if (!user) {
          res.status(404).json({ error: 'Usuario no encontrado' });
          return;
        }
        res.status(200).json({ user });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca usuarios por nombre de usuario o término de búsqueda.
   * Endpoint: GET /api/users/search
   *
   * @param req - Objeto de solicitud HTTP con { q | query, limit? } en la query string.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de usuarios coincidentes.
   */
  static async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene la lista paginada de todos los usuarios registrados (solo administradores).
   * Endpoint: GET /api/users
   *
   * @param req - Objeto de solicitud HTTP con { page?, limit? } en la query string.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista paginada de usuarios.
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;

      const pageNum = page ? parseInt(page as string) : 1;
      const limitNum = limit ? parseInt(limit as string) : 50;

      const result = await UserService.getAllUsers(pageNum, limitNum);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un usuario del sistema (solo administradores).
   * Endpoint: DELETE /api/users/:userId
   *
   * @param req - Objeto de solicitud HTTP. Los parámetros deben incluir el ID del usuario.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de eliminación.
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;

      await UserService.deleteUser(userId);

      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina la cuenta del usuario autenticado de forma permanente (self-service).
   * Endpoint: DELETE /api/users/me
   *
  * @param req - Objeto de solicitud HTTP autenticado.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de eliminación de cuenta.
   */
  static async deleteMyAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      await UserService.deleteMyAccount(req.user.userId);
      res.status(200).json({ message: 'Cuenta eliminada permanentemente' });
    } catch (error) {
      next(error);
    }
  }
}
