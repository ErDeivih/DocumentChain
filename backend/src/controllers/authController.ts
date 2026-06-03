import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import logger from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: 'El nombre de usuario, email y contraseña son obligatorios' });
        return;
      }

      const result = await AuthService.register({ username, email, password, fullName, adminSecret: req.body.adminSecret });
      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      logger.error('Error en el registro:', err);
      res.status(err.message.includes('ya existe') ? 409 : 400).json({ error: err.message || 'Error en el registro' });
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
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'Error en el inicio de sesión' });
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
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Error al cerrar sesión' });
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
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'Error al refrescar token' });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
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
      res.status(500).json({ error: error instanceof Error ? error.message : 'Error al obtener perfil' });
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
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Error al cambiar contraseña' });
    }
  }
}
