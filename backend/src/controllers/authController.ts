import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { TwoFactorService } from '../services/twoFactorService';
import { TokenService } from '../services/tokenService';
import { Argon2Service } from '../services/argon2Service';
import { validatePassword } from '../validators/passwordPolicy';
import crypto from 'crypto';
import prisma from '../config/database';
import { emailService } from '../services/emailService';
import bcrypt from 'bcrypt';
import { getAddress, isAddress } from 'ethers';
import { KeyManager } from '../lib/crypto/KeyManager';
import logger from '../utils/logger';

const SALT_ROUNDS = 10;

export class AuthController {
  // ========================================
  // NEW WALLET-BASED AUTHENTICATION
  // ========================================

  /**
   * Prepare registration with wallet-based encryption
   * Frontend generates keypair and encrypts private key with user's password
   * POST /api/auth/prepare-register
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
        adminSecret 
      } = req.body;

      // Validate required fields
      if (!username || !email || !publicKey || !encryptedPrivateKey) {
        res.status(400).json({ 
          error: 'Username, email, publicKey and encryptedPrivateKey are required' 
        });
        return;
      }

      logger.debug(`[prepare-register][controller] username=${username} email=${email} publicKeyLen=${publicKey?.length ?? 0} encryptedPrivateKeyLen=${encryptedPrivateKey?.length ?? 0}`);

      const result = await AuthService.prepareRegister({
        username,
        email,
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash,
        encryptedPrivateKeyRecovery,
        fullName,
        adminSecret
      });

      logger.debug(`[prepare-register][controller] storedUserId=${result.user.id} publicKeyLen=${result.user.publicKey?.length ?? 0}`);

      logger.info(`Wallet-based registration successful for user: ${username}`);

      res.status(201).json(result);
    } catch (error: any) {
      logger.error('Error in prepare-register:', error);
      res.status(400).json({ error: error.message || 'Error in registration' });
    }
  }

  /**
   * Login with wallet signature
   * User signs a challenge message with their wallet
   * POST /api/auth/wallet-login
   */
  static async walletLogin(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress, signature, message } = req.body;

      if (!walletAddress || !signature || !message) {
        res.status(400).json({ 
          error: 'Wallet address, signature and message are required' 
        });
        return;
      }

      const result = await AuthService.loginWithWallet({
        walletAddress,
        signature,
        message
      });

      logger.info(`Wallet login successful for: ${walletAddress}`);

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error in wallet-login:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Get challenge message for wallet login
   * GET /api/auth/challenge/:walletAddress
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

      // Find user by wallet address
      const wallet = await prisma.wallet.findFirst({
        where: { walletAddress: normalizedWalletAddress },
        include: { user: true }
      });

      if (!wallet) {
        res.status(404).json({ error: 'Wallet not registered' });
        return;
      }

      // Generate challenge message
      const nonce = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now();
      const challenge = `Sign this message to authenticate: ${wallet.user.id}:${timestamp}:${nonce}`;

      // Store challenge temporarily (in production, use Redis with TTL)
      // For now, we'll trust the timestamp validation
      const challengeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      res.status(200).json({
        challenge,
        nonce,
        timestamp,
        expiresAt: challengeExpiry.toISOString()
      });
    } catch (error: any) {
      logger.error('Error generating challenge:', error);
      res.status(500).json({ error: 'Error generating challenge' });
    }
  }

  /**
   * Update encrypted private key (for password changes in frontend)
   * POST /api/auth/update-keys
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

  // ========================================
  // LEGACY AUTHENTICATION (DEPRECATED)
  // ========================================

  /**
   * @deprecated Use prepareRegister instead
   * Registrar un nuevo usuario
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, fullName } = req.body;

      // Validar entrada - Validación a nivel de controlador
      if (!username || !email || !password) {
        res.status(400).json({ error: 'El nombre de usuario, email y contraseña son obligatorios' });
        return;
      }

      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: username }
          ]
        }
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
        adminSecret: req.body.adminSecret
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error en el registro:', error);
      res.status(400).json({ error: error.message || 'Error en el registro' });
    }
  }

  /**
   * Iniciar sesión de usuario
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      const identifier = (username || email || '').trim();

      if (!identifier || !password) {
        res.status(400).json({ error: 'El nombre de usuario/email y contraseña son obligatorios' });
        return;
      }

      const result = await AuthService.login({ identifier, password });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Cerrar sesión de usuario
   * POST /api/auth/logout
   */
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

  /**
   * Refrescar token de acceso
   * POST /api/auth/refresh
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
   * Obtener información del usuario actual
   * GET /api/auth/me
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
          fullName: true,
          role: true,
          publicKey: true,
          encryptedPrivateKey: true,
          createdAt: true,
          isSuspended: true,
          suspendedAt: true,
          suspendReason: true,
          wallets: {
            select: {
              id: true,
              walletAddress: true,
              nickname: true,
              isPrimary: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { addedAt: 'asc' },
            ],
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
   * Cambiar contraseña
   * POST /api/auth/change-password
   */
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

      await AuthService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );

      res.status(200).json({ message: 'Contraseña cambiada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'El email es obligatorio' });
        return;
      }

      // Buscar usuario por email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      // Siempre devolver éxito aunque no se encuentre el usuario (buena práctica de seguridad)
      if (!user) {
        res.status(200).json({
          message: 'Si existe una cuenta con ese email, se ha enviado un enlace de restablecimiento de contraseña'
        });
        return;
      }

      // Generar token de restablecimiento (32 bytes = 64 caracteres hex)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Almacenar token hasheado en la tabla de sesiones (reutilizando para restablecimientos)
      // Expira en 1 hora
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accessToken: hashedToken,
          refreshToken: hashedToken, // Mismo para restablecimiento de contraseña
          accessTokenExpiresAt: expiresAt,
          refreshTokenExpiresAt: expiresAt
        }
      });

      try {
        // El flujo público no debe fallar si el MTA rechaza o retrasa el envío.
        await emailService.sendPasswordResetEmail(
          user.email,
          user.username,
          resetToken
        );
      } catch (emailError) {
        console.warn(`No se pudo enviar el email de restablecimiento a ${user.email}:`, emailError);
      }

      res.status(200).json({
        message: 'Si existe una cuenta con ese email, se ha enviado un enlace de restablecimiento de contraseña'
      });
    } catch (error: any) {
      console.error('Error en solicitud de restablecimiento de contraseña:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud de restablecimiento de contraseña' });
    }
  }

  /**
   * Restablecer contraseña con token y clave de recuperación
   * POST /api/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword, recoveryKey } = req.body;

      if (!token || !newPassword || !recoveryKey) {
        res.status(400).json({ error: 'El token, la nueva contraseña y la clave de recuperación son obligatorios' });
        return;
      }

      // Hashear el token para buscarlo en la base de datos
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Buscar token de restablecimiento válido
      const resetSession = await prisma.session.findFirst({
        where: {
          accessToken: hashedToken,
          accessTokenExpiresAt: { gte: new Date() }
        },
        include: {
          user: true
        }
      });

      if (!resetSession) {
        res.status(400).json({ error: 'Token de restablecimiento inválido o expirado' });
        return;
      }

      const user = resetSession.user;

      // Validar hash de la clave de recuperación
      if (!user.recoveryKeyHash || !user.encryptedPrivateKeyRecovery) {
        res.status(400).json({
          error: 'Cuenta creada antes de la funcionalidad de clave de recuperación. No se pueden recuperar documentos automáticamente. Por favor, contacte con soporte.'
        });
        return;
      }

      const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);

      if (recoveryKeyHash !== user.recoveryKeyHash) {
        res.status(400).json({ error: 'Clave de recuperación inválida' });
        return;
      }

      // Descifrar clave privada con clave de recuperación
      let privateKey: string;
      try {
        privateKey = KeyManager.decryptPrivateKeyWithRecovery(
          user.encryptedPrivateKeyRecovery,
          recoveryKey
        );
      } catch (error) {
        res.status(400).json({ error: 'Error al descifrar la clave privada con la clave de recuperación' });
        return;
      }

      // Re-encrypt private key with new password
      const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, newPassword);

      // Validar nueva contraseña con política robusta
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        res.status(400).json({
          error: `Validación de contraseña fallida: ${passwordValidation.errors.join(', ')}`
        });
        return;
      }

      // Hash new password with Argon2id
      const passwordHash = await Argon2Service.hash(newPassword);

      logger.info(`Restablecimiento de contraseña con fortaleza: ${passwordValidation.strength}`);

      // Actualizar contraseña del usuario (las claves permanecen igual, solo se recifran con la nueva contraseña)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          encryptedPrivateKey
          // publicKey permanece igual
          // recoveryKeyHash permanece igual
          // encryptedPrivateKeyRecovery permanece igual
        }
      });

      // Eliminar token de restablecimiento y todas las sesiones del usuario (forzar reinicio de sesión)
      await prisma.session.deleteMany({
        where: { userId: user.id }
      });

      res.status(200).json({
        message: 'Contraseña restablecida correctamente. Por favor, inicie sesión con su nueva contraseña.',
        success: 'Todos sus documentos siguen siendo accesibles con la nueva contraseña.'
      });
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
  }

  // ========================================
  // AUTENTICACIÓN DE DOS FACTORES (2FA/TOTP)
  // ========================================

  /**
   * Obtener estado de 2FA
   * GET /api/auth/2fa/status
   * Requiere autenticación
   */
  static async get2FAStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorEnabled: true,
          twoFactorBackupCodes: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      const backupCodesRemaining = user.twoFactorBackupCodes
        ? TwoFactorService.countRemainingBackupCodes(user.twoFactorBackupCodes)
        : 0;

      res.status(200).json({
        enabled: user.twoFactorEnabled,
        backupCodesRemaining
      });
    } catch (error: any) {
      logger.error('Error al obtener estado de 2FA:', error);
      res.status(500).json({ error: 'Error al obtener el estado de 2FA' });
    }
  }

  /**
   * Configurar 2FA (generar código QR y códigos de respaldo)
   * POST /api/auth/2fa/setup
   * Requiere autenticación
   * ⚠️ 2FA NO SE ACTIVA hasta llamar /enable
   */
  static async setup2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, username: true, twoFactorEnabled: true }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (user.twoFactorEnabled) {
        res.status(400).json({ error: '2FA ya está activado' });
        return;
      }

      // Generar secreto TOTP, código QR y códigos de respaldo
      const setup = await TwoFactorService.setup(user.email, user.username);

      // Hashear códigos de respaldo
      const hashedBackupCodes = await TwoFactorService.hashBackupCodes(setup.backupCodes);

      // Almacenar secreto y códigos de respaldo (aún NO activado)
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: setup.secret,
          twoFactorBackupCodes: JSON.stringify(hashedBackupCodes)
          // twoFactorEnabled: false (aún desactivado)
        }
      });

      logger.info(`Configuración de 2FA iniciada para el usuario ${userId}`);

      res.status(200).json({
        secret: setup.secret,
        qrCode: setup.qrCode,
        backupCodes: setup.backupCodes, // ⚠️ MOSTRAR SOLO UNA VEZ
        otpauthUrl: setup.otpauthUrl
      });
    } catch (error: any) {
      logger.error('Error al configurar 2FA:', error);
      res.status(500).json({ error: 'Error al configurar 2FA' });
    }
  }

  /**
   * Activar 2FA (verificar código y activar)
   * POST /api/auth/2fa/enable
   * Body: { token: "123456" }
   * Requiere autenticación
   */
  static async enable2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'El token TOTP es obligatorio' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorSecret: true,
          twoFactorEnabled: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (user.twoFactorEnabled) {
        res.status(400).json({ error: '2FA ya está activado' });
        return;
      }

      if (!user.twoFactorSecret) {
        res.status(400).json({ error: 'Por favor, configure 2FA primero (llame a /setup)' });
        return;
      }

      // Verificar token TOTP
      const isValid = TwoFactorService.verifyTOTP(token, user.twoFactorSecret);

      if (!isValid) {
        res.status(400).json({ error: 'Token TOTP inválido' });
        return;
      }

      // ✅ Activar 2FA
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true }
      });

      logger.info(`✅ 2FA activado para el usuario ${userId}`);

      res.status(200).json({
        message: '2FA activado correctamente',
        enabled: true
      });
    } catch (error: any) {
      logger.error('Error al activar 2FA:', error);
      res.status(500).json({ error: 'Error al activar 2FA' });
    }
  }

  /**
   * Desactivar 2FA
   * POST /api/auth/2fa/disable
   * Body: { token: "123456" }
   * Requiere autenticación
   */
  static async disable2FA(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'El token TOTP es obligatorio para desactivar 2FA' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorSecret: true,
          twoFactorEnabled: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (!user.twoFactorEnabled) {
        res.status(400).json({ error: '2FA no está activado' });
        return;
      }

      if (!user.twoFactorSecret) {
        res.status(400).json({ error: 'Configuración de 2FA inválida' });
        return;
      }

      // Verificar token TOTP antes de desactivar
      const isValid = TwoFactorService.verifyTOTP(token, user.twoFactorSecret);

      if (!isValid) {
        res.status(400).json({ error: 'Token TOTP inválido' });
        return;
      }

      // Desactivar 2FA y limpiar secretos
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null
        }
      });

      logger.warn(`2FA desactivado para el usuario ${userId}`);

      res.status(200).json({
        message: '2FA desactivado correctamente',
        enabled: false
      });
    } catch (error: any) {
      logger.error('Error al desactivar 2FA:', error);
      res.status(500).json({ error: 'Error al desactivar 2FA' });
    }
  }

  /**
   * Verificar código 2FA (después del login)
   * POST /api/auth/2fa/verify
   * Body: { tempToken: "...", token: "123456" }
   * No requiere autenticación (usa tempToken)
   */
  static async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const { tempToken, token } = req.body;

      if (!tempToken || !token) {
        res.status(400).json({ error: 'El token temporal y el token TOTP son obligatorios' });
        return;
      }

      // Verificar token temporal
      let decoded;
      try {
        decoded = TokenService.verifyTempToken(tempToken);
      } catch (error) {
        res.status(401).json({ error: 'Token temporal inválido o expirado' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          publicKey: true,
          encryptedPrivateKey: true,
          twoFactorSecret: true,
          twoFactorBackupCodes: true,
          twoFactorEnabled: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        res.status(400).json({ error: '2FA no está activado para este usuario' });
        return;
      }

      // Verificar código 2FA (TOTP o código de respaldo)
      const verification = await TwoFactorService.verify(
        token,
        user.twoFactorSecret,
        user.twoFactorBackupCodes || '[]'
      );

      if (!verification.valid) {
        res.status(401).json({ error: 'Código 2FA inválido' });
        return;
      }

      // Actualizar códigos de respaldo si se usó uno
      if (verification.type === 'backup' && verification.updatedBackupCodesJson) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorBackupCodes: verification.updatedBackupCodesJson
          }
        });

        logger.warn(`Código de respaldo usado para el usuario ${user.id}. Restantes: ${verification.remainingBackupCodes}`);
      }

      // Generar par de tokens final
      const tokens = await TokenService.generateTokenPair(
        user.id,
        user.username,
        user.role
      );

      logger.info(`Verificación 2FA exitosa para el usuario ${user.id}`);

      res.status(200).json({
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          publicKey: user.publicKey,
          encryptedPrivateKey: user.encryptedPrivateKey
        }
      });
    } catch (error: any) {
      logger.error('Error al verificar 2FA:', error);
      res.status(500).json({ error: 'Error al verificar el código 2FA' });
    }
  }

  /**
   * Regenerar códigos de respaldo
   * POST /api/auth/2fa/regenerate-backup-codes
   * Body: { token: "123456" }
   * Requiere autenticación
   */
  static async regenerateBackupCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'El token TOTP es obligatorio' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorSecret: true,
          twoFactorEnabled: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        res.status(400).json({ error: '2FA no está activado' });
        return;
      }

      // Verificar token TOTP antes de regenerar
      const isValid = TwoFactorService.verifyTOTP(token, user.twoFactorSecret);

      if (!isValid) {
        res.status(400).json({ error: 'Token TOTP inválido' });
        return;
      }

      // Generar nuevos códigos de respaldo
      const newBackupCodes = TwoFactorService.regenerateBackupCodes();
      const hashedBackupCodes = await TwoFactorService.hashBackupCodes(newBackupCodes);

      // Actualizar en la base de datos
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorBackupCodes: JSON.stringify(hashedBackupCodes)
        }
      });

      logger.info(`Códigos de respaldo regenerados para el usuario ${userId}`);

      res.status(200).json({
        message: 'Códigos de respaldo regenerados correctamente',
        backupCodes: newBackupCodes // ⚠️ MOSTRAR SOLO UNA VEZ
      });
    } catch (error: any) {
      logger.error('Error al regenerar códigos de respaldo:', error);
      res.status(500).json({ error: 'Error al regenerar los códigos de respaldo' });
    }
  }
}
