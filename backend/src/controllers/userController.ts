import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../config/database';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';
import { SuspensionFlowError, UserSuspensionService } from '../services/userSuspensionService';
import { ipfsService } from '../services/ipfsService';
import {
  DOCUMENT_REGISTRY_ADDRESS,
  documentRegistryInterface,
  provider,
} from '../config/blockchain';

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

  /**
   * Update user avatar
   * PUT /api/users/me/avatar
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
   * Remove user avatar
   * DELETE /api/users/me/avatar
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
   * Delete own account (self-service)
   * DELETE /api/users/me
   * Body: { txHash: string }
   */
  static async deleteMyAccount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { txHash } = req.body;
      if (!txHash) {
        res.status(400).json({ error: 'Se requiere txHash de la transacción suspendMyself' });
        return;
      }

      const userId = req.user.userId;
      const user = await UserService.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Get primary wallet
      const wallet = await prisma.wallet.findFirst({
        where: { userId, isPrimary: true },
        select: { walletAddress: true },
      });

      if (!wallet) {
        res.status(409).json({ error: 'Debes configurar una wallet principal antes de eliminar la cuenta' });
        return;
      }

      // Validate suspension transaction on-chain
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          res.status(400).json({ error: 'La transacción todavía no está confirmada' });
          return;
        }
        if (Number(receipt.status) !== 1) {
          res.status(400).json({ error: 'La transacción ha fallado en blockchain' });
          return;
        }

        const tx = await provider.getTransaction(txHash);
        if (!tx || !tx.to || tx.to.toLowerCase() !== (DOCUMENT_REGISTRY_ADDRESS || '').toLowerCase()) {
          res.status(400).json({ error: 'La transacción no apunta al contrato DocumentRegistry' });
          return;
        }
        if (tx.from.toLowerCase() !== wallet.walletAddress.toLowerCase()) {
          res.status(403).json({ error: 'La transacción debe estar firmada por la wallet principal' });
          return;
        }

        const parsed = documentRegistryInterface.parseTransaction({ data: tx.data, value: tx.value });
        if (!parsed || parsed.name !== 'suspendMyself') {
          res.status(400).json({ error: 'La transacción no ejecuta suspendMyself' });
          return;
        }
      } catch (txError: any) {
        logger.error('Error validando transacción de eliminación:', txError);
        res.status(400).json({ error: 'No se ha podido validar la transacción en blockchain' });
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
            await ipfsService.unpinFile(cid);
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

  private static handleSuspensionError(res: Response, error: any, fallbackMessage: string): void {
    if (error instanceof SuspensionFlowError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    logger.error(fallbackMessage, error);
    res.status(500).json({ error: fallbackMessage });
  }
}
