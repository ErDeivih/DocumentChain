import { Request, Response } from 'express';
import crypto from 'crypto';
import { getAddress, isAddress } from 'ethers';
import prisma from '../config/database';
import { AuthService } from '../services/authService';
import { EmailController } from './EmailController';
import logger from '../utils/logger';

/**
 * Controlador de autenticacion.
 * Mantiene unicamente los endpoints actualmente expuestos por las rutas.
 */
export class AuthController {
  /**
   * Prepara el registro wallet-based.
   */
  static async prepareRegister(req: Request, res: Response): Promise<void> {
    try {
      const {
        username,
        email,
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash,
        encryptedPrivateKeyRecovery,
        fullName,
        adminSecret,
      } = req.body;

      if (!username || !email || !publicKey || !encryptedPrivateKey) {
        res.status(400).json({
          error: 'Username, email, publicKey and encryptedPrivateKey are required',
        });
        return;
      }

      const result = await AuthService.prepareRegister({
        username,
        email,
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash,
        encryptedPrivateKeyRecovery,
        fullName,
        adminSecret,
      });

      logger.info(`Wallet-based registration successful for user: ${username}`);
      res.status(201).json(result);
    } catch (error: any) {
      logger.error('Error in prepare-register:', error);
      res.status(400).json({ error: error.message || 'Error in registration' });
    }
  }

  /**
   * Login wallet-based con firma.
   */
  static async walletLogin(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress, signature, message } = req.body;

      if (!walletAddress || !signature || !message) {
        res.status(400).json({
          error: 'Wallet address, signature and message are required',
        });
        return;
      }

      const result = await AuthService.loginWithWallet({
        walletAddress,
        signature,
        message,
      });

      logger.info(`Wallet login successful for: ${walletAddress}`);
      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error in wallet-login:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Genera challenge para login con wallet.
   */
  static async getChallenge(req: Request, res: Response): Promise<void> {
    try {
      const walletAddress = req.params.walletAddress as string;

      if (!walletAddress) {
        res.status(400).json({ error: 'Wallet address is required' });
        return;
      }

      if (!isAddress(walletAddress)) {
        res.status(400).json({ error: 'Invalid wallet address' });
        return;
      }

      const normalizedWalletAddress = getAddress(walletAddress);
      const wallet = await prisma.wallet.findFirst({
        where: { walletAddress: normalizedWalletAddress },
        include: { user: true },
      });

      if (!wallet) {
        res.status(404).json({ error: 'Wallet not registered' });
        return;
      }

      const nonce = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      const challenge = `Sign this message to authenticate: ${wallet.user.id}:${timestamp}:${nonce}`;
      const challengeExpiry = new Date(Date.now() + 5 * 60 * 1000);

      res.status(200).json({
        challenge,
        nonce,
        timestamp,
        expiresAt: challengeExpiry.toISOString(),
      });
    } catch (error: any) {
      logger.error('Error generating challenge:', error);
      res.status(500).json({ error: 'Error generating challenge' });
    }
  }

  /**
   * Actualiza claves cifradas del usuario autenticado.
   */
  static async updateKeys(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { encryptedPrivateKey, publicKey } = req.body;

      if (!encryptedPrivateKey) {
        res.status(400).json({ error: 'Encrypted private key is required' });
        return;
      }

      await AuthService.updateEncryptedPrivateKey(userId, encryptedPrivateKey, publicKey);

      logger.info(`Keys updated for user: ${userId}`);
      res.status(200).json({ message: 'Keys updated successfully' });
    } catch (error: any) {
      logger.error('Error updating keys:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Registro legado email/password.
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: 'El nombre de usuario, email y contrasena son obligatorios' });
        return;
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: email.toLowerCase() }, { username }],
        },
      });

      if (existingUser) {
        res.status(409).json({ error: 'Ya existe un usuario con este email o nombre de usuario' });
        return;
      }

      const result = await AuthService.register({
        username,
        email,
        password,
        fullName,
        adminSecret: req.body.adminSecret,
      });

      res.status(201).json(result);
    } catch (error: any) {
      logger.error('Error en el registro:', error);
      res.status(400).json({ error: error.message || 'Error en el registro' });
    }
  }

  /**
   * Login legado email/username + password.
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, identifier, password } = req.body;
      const normalizedIdentifier = (identifier || username || email || '').trim();

      if (!normalizedIdentifier || !password) {
        res.status(400).json({ error: 'El nombre de usuario/email y contrasena son obligatorios' });
        return;
      }

      const result = await AuthService.login({ identifier: normalizedIdentifier, password });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Logout del usuario autenticado.
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'El token de refresco es obligatorio' });
        return;
      }

      await AuthService.logout(refreshToken);
      res.status(200).json({ message: 'Sesion cerrada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Refresca token de acceso.
   */
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

  /**
   * Perfil del usuario autenticado.
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          fullName: true,
          role: true,
          publicKey: true,
          encryptedPrivateKey: true,
          avatarUrl: true,
          createdAt: true,
          wallets: {
            select: {
              id: true,
              walletAddress: true,
              nickname: true,
              isPrimary: true,
            },
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
          lastLogin: null,
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

  /**
   * Cambio de contrasena autenticado.
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'La contrasena actual y la nueva son obligatorias' });
        return;
      }

      await AuthService.changePassword(req.user.userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Contrasena cambiada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Compatibilidad legacy: delega reset de contrasena al EmailController.
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    await EmailController.forgotPassword(req, res);
  }

  /**
   * Compatibilidad legacy: delega confirmacion de reset al EmailController.
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    await EmailController.resetPassword(req, res);
  }
}
