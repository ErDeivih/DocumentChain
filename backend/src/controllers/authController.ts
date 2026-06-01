import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthService } from '../services/authService';
import logger from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: 'El nombre de usuario, email y contraseña son obligatorios' });
        return;
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: email.toLowerCase() }, { username }] },
      });

      if (existingUser) {
        res.status(409).json({ error: 'Ya existe un usuario con este email o nombre de usuario' });
        return;
      }

      const result = await AuthService.register({ username, email, password, fullName, adminSecret: req.body.adminSecret });
      res.status(201).json(result);
    } catch (error: any) {
      logger.error('Error en el registro:', error);
      res.status(400).json({ error: error.message || 'Error en el registro' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, identifier, password } = req.body;
      const normalizedIdentifier = (identifier || username || email || '').trim();

      if (!normalizedIdentifier || !password) {
        res.status(400).json({ error: 'El nombre de usuario/email y contraseña son obligatorios' });
        return;
      }

      const result = await AuthService.login({ identifier: normalizedIdentifier, password });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'El token de refresco es obligatorio' });
        return;
      }
      await AuthService.logout(refreshToken);
      res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'El token de refresco es obligatorio' });
        return;
      }
      const result = await AuthService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true, username: true, email: true, emailVerified: true,
          fullName: true, role: true, publicKey: true,
          encryptedPrivateKey: true, avatarUrl: true, createdAt: true,
          wallets: {
            select: { id: true, walletAddress: true, nickname: true, isPrimary: true },
            orderBy: [{ isPrimary: 'desc' }, { addedAt: 'asc' }],
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({
        user: {
          ...user,
          wallets: user.wallets.map((wallet) => ({
            id: wallet.id,
            address: wallet.walletAddress,
            label: wallet.nickname,
            isPrimary: wallet.isPrimary,
          })),
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'La contraseña actual y la nueva son obligatorias' });
        return;
      }
      await AuthService.changePassword(req.user.userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Contraseña cambiada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
