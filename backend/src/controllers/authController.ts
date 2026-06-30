import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import logger from '../utils/logger';

/**
 * Controlador de autenticación. Gestiona registro, inicio de sesión y renovación de tokens.
 */
export class AuthController {

  /**
   * Registra un nuevo usuario en el sistema.
   * Endpoint: POST /api/auth/register
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, fullName, adminSecret, publicKey, encryptedPrivateKey, recoveryKeyHash, encryptedPrivateKeyRecovery, recoveryKeySalt } = req.body;

      const result = await AuthService.register({ username, email, password, fullName, adminSecret, publicKey, encryptedPrivateKey, recoveryKeyHash, encryptedPrivateKeyRecovery, recoveryKeySalt });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Autentica un usuario y retorna tokens JWT.
   * Endpoint: POST /api/auth/login
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Cierra la sesión del usuario invalidando el refresh token.
   * Endpoint: POST /api/auth/logout
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'El token de refresco es obligatorio' });
        return;
      }
      await AuthService.logout(refreshToken);
      res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresca el access token usando un refresh token válido.
   * Endpoint: POST /api/auth/refresh
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'El token de refresco es obligatorio' });
        return;
      }
      const result = await AuthService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna los datos del usuario autenticado actual.
   * Endpoint: GET /api/auth/me
   * @param {Request} req - Solicitud HTTP
   * @param {Response} res - Respuesta HTTP
   * @returns {Promise<void>}
   */
  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
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
   * Cambia la contraseña del usuario autenticado.
   * El frontend ya ha re-cifrado la clave privada con la nueva contraseña.
   * Endpoint: POST /api/auth/change-password
   * @param {Request} req - Solicitud HTTP con { currentPassword, newEncryptedPrivateKey, newSalt, newPassword }.
   * @param {Response} res - Respuesta HTTP.
   * @returns {Promise<void>}
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const { currentPassword, newEncryptedPrivateKey, newSalt, newPassword } = req.body;
      await AuthService.changePassword(req.user.userId, currentPassword, newEncryptedPrivateKey, newSalt, newPassword);
      res.status(200).json({ message: 'Contraseña cambiada correctamente' });
    } catch (error) {
      next(error);
    }
  }

}
