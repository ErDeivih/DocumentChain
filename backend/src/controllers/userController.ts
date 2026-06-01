import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../config/database';
import { UserService } from '../services/userService';
import logger from '../utils/logger';
import { unpinFromIPFS } from '../config/ipfs';

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
   * Actualiza el perfil del usuario autenticado.
   * Endpoint: PUT /api/users/profile
   *
   * @param req - Objeto de solicitud HTTP autenticado con { email?, fullName? } en el cuerpo.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el perfil actualizado.
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
   * Obtiene un usuario por su nombre de usuario (información limitada por privacidad).
   * Endpoint: GET /api/users/username/:username
   *
   * @param req - Objeto de solicitud HTTP. Los parámetros deben incluir el nombre de usuario.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos públicos del usuario.
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
   * Obtiene un usuario por su identificador único.
   * Endpoint: GET /api/users/:userId
   *
   * @param req - Objeto de solicitud HTTP. Los parámetros deben incluir el ID del usuario.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con los datos del usuario.
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
   * Busca usuarios por nombre de usuario o término de búsqueda.
   * Endpoint: GET /api/users/search
   *
   * @param req - Objeto de solicitud HTTP con { q | query, limit? } en la query string.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista de usuarios coincidentes.
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
   * Obtiene la lista paginada de todos los usuarios registrados (solo administradores).
   * Endpoint: GET /api/users
   *
   * @param req - Objeto de solicitud HTTP con { page?, limit? } en la query string.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la lista paginada de usuarios.
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
   * Elimina un usuario del sistema (solo administradores).
   * Endpoint: DELETE /api/users/:userId
   *
   * @param req - Objeto de solicitud HTTP. Los parámetros deben incluir el ID del usuario.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con la confirmación de eliminación.
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

  /**
   * Actualiza el avatar del usuario autenticado.
   * Endpoint: PUT /api/users/me/avatar
   *
   * @param req - Objeto de solicitud HTTP autenticado con el archivo de imagen.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el usuario actualizado.
   */
  static async updateAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
        return;
      }

      const userId = req.user.userId;
      const ext = path.extname(file.originalname) || '.png';
      const filename = `${userId}-${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
      const filepath = path.join(uploadDir, filename);

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Remove old avatar if exists
      const currentUser = await UserService.getUserById(userId);
      if (currentUser?.avatarUrl) {
        const oldPath = path.join(process.cwd(), currentUser.avatarUrl.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Write new file
      fs.writeFileSync(filepath, file.buffer);

      const avatarUrl = `/uploads/avatars/${filename}`;
      const user = await UserService.updateAvatar(userId, avatarUrl);

      res.status(200).json({ user });
    } catch (error: any) {
      logger.error('Error updating avatar:', error);
      res.status(400).json({ error: error.message || 'Error al actualizar el avatar' });
    }
  }

  /**
   * Elimina el avatar del usuario autenticado.
   * Endpoint: DELETE /api/users/me/avatar
   *
   * @param req - Objeto de solicitud HTTP autenticado.
   * @param res - Objeto de respuesta HTTP.
   * @returns Promesa que resuelve con el usuario actualizado.
   */
  static async removeAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const userId = req.user.userId;
      const currentUser = await UserService.getUserById(userId);

      if (currentUser?.avatarUrl) {
        const oldPath = path.join(process.cwd(), currentUser.avatarUrl.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const user = await UserService.removeAvatar(userId);
      res.status(200).json({ user });
    } catch (error: any) {
      logger.error('Error removing avatar:', error);
      res.status(400).json({ error: error.message || 'Error al eliminar el avatar' });
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
  static async deleteMyAccount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const userId = req.user.userId;
      const user = await UserService.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Unpin all IPFS CIDs for documents owned by this user
      try {
        const documents = await prisma.document.findMany({
          where: { ownerId: userId },
          include: { versions: { select: { ipfsCid: true } } },
        });

        const cidsToUnpin = new Set<string>();
        for (const doc of documents) {
          for (const version of doc.versions) {
            if (version.ipfsCid) cidsToUnpin.add(version.ipfsCid);
          }
        }

        for (const cid of cidsToUnpin) {
          try {
            await unpinFromIPFS(cid);
            logger.info(`Despineado CID ${cid} para usuario ${userId}`);
          } catch (ipfsError) {
            logger.warn(`No se pudo despinear CID ${cid}:`, ipfsError);
          }
        }
      } catch (ipfsError) {
        logger.error('Error durante unpin de IPFS:', ipfsError);
        // Continue with deletion even if unpin fails
      }

      // Remove avatar file if exists
      if (user.avatarUrl) {
        const avatarPath = path.join(process.cwd(), user.avatarUrl.replace(/^\//, ''));
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }

      // Hard delete user (cascades to all related data)
      await prisma.user.delete({ where: { id: userId } });

      logger.info(`Usuario eliminado: ${user.username} (${userId})`);
      res.status(200).json({ message: 'Cuenta eliminada permanentemente' });
    } catch (error: any) {
      logger.error('Error eliminando cuenta:', error);
      res.status(500).json({ error: error.message || 'Error al eliminar la cuenta' });
    }
  }
}
