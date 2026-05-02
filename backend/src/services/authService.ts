import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getAddress, isAddress, verifyMessage as ethersVerifyMessage } from 'ethers';
import prisma from '../config/database';
import { TokenService } from './tokenService';
import { KeyManager } from '../lib/crypto/KeyManager';
import { Argon2Service } from './argon2Service';
import { validatePassword } from '../validators/passwordPolicy';
import { emailService } from './emailService';
import logger from '../utils/logger';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  adminSecret?: string; // Optional secret to create admin user
}

// NEW: Input for wallet-based registration
export interface PrepareRegisterInput {
  username: string;
  email: string;
  publicKey: string;              // Generated in frontend
  encryptedPrivateKey: string;     // Encrypted in frontend with user's password
  recoveryKeyHash?: string;       // Optional: hash of recovery key
  encryptedPrivateKeyRecovery?: string; // Optional: private key encrypted with recovery key
  fullName?: string;
  adminSecret?: string;
}

export interface LoginInput {
  identifier: string; // username or email
  password: string;
}

// NEW: Input for wallet-based login
export interface WalletLoginInput {
  walletAddress: string;
  signature: string;              // Signature of challenge message
  message: string;                // The challenge message that was signed
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  recoveryKey?: string; // Only included in registration response
  requires2FA?: boolean; // If 2FA is enabled, client must call /auth/2fa/verify
  tempToken?: string; // Temporary token for 2FA verification (5 min expiry)
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string | null;
    role: string;
    publicKey: string;
    encryptedPrivateKey?: string;
    emailVerified: boolean;
    avatarUrl: string | null;
    createdAt: Date;
    lastLogin: null;
  };
}

export class AuthService {
  // ==================== NEW WALLET-BASED AUTHENTICATION ====================

  /**
   * Prepare registration with wallet-based encryption.
   * Frontend generates keypair and encrypts private key with user's password.
   * Backend only stores the encrypted data.
   */
  static async prepareRegister(input: PrepareRegisterInput): Promise<AuthResponse> {
    const { 
      username, 
      email, 
      publicKey, 
      encryptedPrivateKey, 
      recoveryKeyHash,
      encryptedPrivateKeyRecovery,
      fullName, 
      adminSecret 
    } = input;

    // Validate input
    if (!username || username.length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!email || !email.includes('@')) {
      throw new Error('Se requiere un email válido');
    }

    if (!publicKey) {
      throw new Error('Se requiere la clave pública');
    }

    if (!encryptedPrivateKey) {
      throw new Error('Se requiere la clave privada cifrada');
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new Error('El email ya existe');
    }

    logger.debug(`[prepare-register][service] creating username=${username} email=${email} publicKeyLen=${publicKey.length} encryptedPrivateKeyLen=${encryptedPrivateKey.length}`);

    // Determine user role (admin if valid secret provided)
    let userRole: 'USER' | 'ADMIN' = 'USER';
    const adminRegistrationSecret = process.env.ADMIN_REGISTRATION_SECRET;
    
    if (adminSecret && adminRegistrationSecret && adminSecret === adminRegistrationSecret) {
      userRole = 'ADMIN';
      logger.info(`Creando usuario ADMIN: ${username}`);
    }

    // Create user - NO password hash stored, only encrypted private key
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        email,
        passwordHash: '', // Empty - passwords are handled in frontend only
        fullName: fullName || null,
        role: userRole,
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash: recoveryKeyHash || null,
        encryptedPrivateKeyRecovery: encryptedPrivateKeyRecovery || null
      }
    });

    logger.debug(`[prepare-register][service] created userId=${user.id} publicKeyLen=${user.publicKey?.length ?? 0} encryptedPrivateKeyLen=${user.encryptedPrivateKey?.length ?? 0}`);

    // Create email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt
      }
    });

    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(user.email, user.username, verificationToken)
      .catch((error: any) => {
        logger.error('Error al enviar email de verificación:', error);
      });

    // Send welcome email (optional, non-blocking)
    emailService.sendWelcomeEmail(user.email, user.username)
      .catch((error: any) => {
        logger.error('Error al enviar email de bienvenida:', error);
      });

    logger.info(`Usuario registrado correctamente: ${username} (${userRole})`);

    // Generate token pair
    const tokens = await TokenService.generateTokenPair(
      user.id,
      user.username,
      user.role
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        publicKey: user.publicKey,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLogin: null
      }
    };
  }

  /**
   * Login with wallet signature.
   * User signs a challenge message with their wallet, backend verifies.
   */
  static async loginWithWallet(input: WalletLoginInput): Promise<AuthResponse> {
    const { walletAddress, signature, message } = input;

    if (!isAddress(walletAddress)) {
      throw new Error('Dirección Ethereum inválida');
    }

    const normalizedWalletAddress = getAddress(walletAddress);

    // Find user by wallet address
    const wallet = await prisma.wallet.findFirst({
      where: { walletAddress: normalizedWalletAddress },
      include: { user: true }
    });

    if (!wallet) {
      throw new Error('Wallet no registrada');
    }

    const user = wallet.user;

    // Validate the challenge message format: "Sign this message to authenticate: <userId>:<timestamp>:<nonce>"
    // The controller's getChallenge generates exactly this format.
    const CHALLENGE_PATTERN = /^Sign this message to authenticate: .+:\d+:[0-9a-f]+$/;
    if (!CHALLENGE_PATTERN.test(message)) {
      throw new Error('Formato de mensaje de reto inválido');
    }

    // Validate the challenge has not expired (5 minute window)
    const parts = message.split(':');
    // Format: "Sign this message to authenticate: <userId>:<timestamp>:<nonce>"
    // parts[0] = "Sign this message to authenticate",  userId has potential colons in UUID (none actually), so
    // safely: extract timestamp (second-to-last) and nonce (last)
    const nonce = parts[parts.length - 1];
    const timestamp = parseInt(parts[parts.length - 2], 10);
    const MAX_CHALLENGE_AGE_MS = 5 * 60 * 1000; // 5 minutes
    if (isNaN(timestamp) || Date.now() - timestamp > MAX_CHALLENGE_AGE_MS) {
      throw new Error('Challenge expirado o inválido');
    }

    // Verify the ECDSA signature: recover the signer address and compare
    let recoveredAddress: string;
    try {
      recoveredAddress = ethersVerifyMessage(message, signature);
    } catch {
      throw new Error('Firma inválida');
    }
    if (recoveredAddress.toLowerCase() !== normalizedWalletAddress.toLowerCase()) {
      throw new Error('La firma no coincide con la dirección de wallet proporcionada');
    }

    logger.info(`Wallet login verified for user ${user.id} with wallet ${normalizedWalletAddress}`);

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      const tempToken = await TokenService.generateTempToken(user.id, user.username);

      logger.info(`Usuario ${user.id} requiere verificación 2FA`);

      return {
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        requires2FA: true,
        tempToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          publicKey: user.publicKey,
          emailVerified: user.emailVerified,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          lastLogin: null
        }
      };
    }

    // Generate token pair
    const tokens = await TokenService.generateTokenPair(
      user.id,
      user.username,
      user.role
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        publicKey: user.publicKey,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLogin: null
      }
    };
  }

  // ==================== LEGACY METHODS (DEPRECATED) ====================

  /**
   * Register with traditional username/password (NOT deprecated)
   * This is the primary registration method for users
   * Generates keypair and encrypts private key with password
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    const { username, email, password, fullName, adminSecret } = input;

    // Validar entrada
    if (!username || username.length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!email || !email.includes('@')) {
      throw new Error('Se requiere un email válido');
    }

    // Validar contraseña con política robusta
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(`Validación de contraseña fallida: ${passwordValidation.errors.join(', ')}`);
    }

    logger.info(`Fortaleza de contraseña: ${passwordValidation.strength} (puntuación: ${passwordValidation.score})`);

    // Verificar si el nombre de usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Verificar si el email ya existe
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      throw new Error('El email ya existe');
    }

    // Generar par de claves ECDH para cifrado
    const { publicKey, privateKey } = KeyManager.generateKeyPair();

    logger.debug(`[register][service] generated keys for username=${username} publicKeyLen=${publicKey.length}`);

    // Generar clave de recuperación para recuperación de cuenta
    const recoveryKey = KeyManager.generateRecoveryKey();
    const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);

    // Cifrar clave privada con la contraseña del usuario
    const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, password);
    
    // Cifrar clave privada con clave de recuperación para recuperación de cuenta
    const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);

    // Hashear contraseña con Argon2id (recomendado por OWASP 2024)
    const hashedPassword = await Argon2Service.hash(password);
    logger.info('Contraseña de usuario hasheada con Argon2id');

    // Determinar rol de usuario (admin si se proporciona secreto válido)
    let userRole: 'USER' | 'ADMIN' = 'USER';
    const adminRegistrationSecret = process.env.ADMIN_REGISTRATION_SECRET;
    
    if (adminSecret && adminRegistrationSecret && adminSecret === adminRegistrationSecret) {
      userRole = 'ADMIN';
      logger.info(`Creando usuario ADMIN: ${username}`);
    }

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        email,
        passwordHash: hashedPassword,
        fullName: fullName || null,
        role: userRole,
        publicKey,
        encryptedPrivateKey,
        recoveryKeyHash,
        encryptedPrivateKeyRecovery
      }
    });

    // Crear token de verificación de email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt
      }
    });

    // Enviar email de verificación (no esperamos resultado para no bloquear)
    emailService.sendVerificationEmail(user.email, user.username, verificationToken)
      .catch((error: any) => {
        logger.error('Error al enviar email de verificación:', error);
        // No lanzamos error para no bloquear el registro
      });

    // Enviar email de bienvenida (opcional)
    emailService.sendWelcomeEmail(user.email, user.username)
      .catch((error: any) => {
        logger.error('Error al enviar email de bienvenida:', error);
      });

    logger.info(`Usuario registrado correctamente: ${username} (${userRole})`);

    // Generar par de tokens (acceso + refresco)
    const tokens = await TokenService.generateTokenPair(
      user.id,
      user.username,
      user.role
    );

    return {
      ...tokens,
      recoveryKey, // Devolver clave de recuperación SOLO durante el registro
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLogin: null
      }
    };
  }

  /**
   * Login existing user
   * Includes automatic migration from bcrypt -> Argon2id
   * Supports 2FA verification
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    const { identifier, password } = input;
    const trimmed = identifier.trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { username: trimmed }
    });

    // Si no se encontró por username, intentar por email (login mixto)
    const resolvedUser = user ?? await prisma.user.findUnique({ where: { email: trimmed.toLowerCase() } });

    if (!resolvedUser) {
      throw new Error('Nombre de usuario o contraseña inválidos');
    }

    // Reemplazar referencia para seguir usando la variable user abajo
    const finalUser = resolvedUser;

    // If user has no password hash (wallet-based user), they can't login with password
    if (!finalUser.passwordHash) {
      throw new Error('Este usuario requiere autenticación con wallet');
    }

    // Detect hash type for automatic migration
    const hashType = Argon2Service.detectHashType(finalUser.passwordHash);
    let isValidPassword = false;
    let needsMigration = false;

    if (hashType === 'argon2id') {
      // Already using Argon2id, verify normally
      isValidPassword = await Argon2Service.verify(finalUser.passwordHash, password);

      // Check if parameters are outdated
      if (isValidPassword) {
        needsMigration = await Argon2Service.needsRehash(finalUser.passwordHash);
      }

    } else if (hashType === 'bcrypt') {
      // Legacy bcrypt hash, verify with bcrypt
      isValidPassword = await bcrypt.compare(password, finalUser.passwordHash);
      needsMigration = isValidPassword; // Always migrate from bcrypt

      if (isValidPassword) {
        logger.info(`Usuario ${finalUser.id} usando hash bcrypt heredado, se migrará a Argon2id`);
      }

    } else {
      // Unknown hash type
      logger.error(`Usuario ${finalUser.id} tiene tipo de hash desconocido: ${hashType}`);
      throw new Error('Nombre de usuario o contraseña inválidos');
    }

    if (!isValidPassword) {
      throw new Error('Nombre de usuario o contraseña inválidos');
    }

    // Verificar que el email esté confirmado antes de permitir el acceso
    if (!finalUser.emailVerified) {
      throw new Error('Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
    }

    if (needsMigration) {
      try {
        const newHash = await Argon2Service.hash(password);
        await prisma.user.update({
          where: { id: finalUser.id },
          data: { passwordHash: newHash }
        });
        logger.info(`Contraseña de usuario ${finalUser.id} migrada a Argon2id exitosamente`);
      } catch (error) {
        logger.error(`Error al migrar contraseña de usuario ${finalUser.id}:`, error);
        // No lanzar error, el login puede continuar
      }
    }

    // Check if 2FA is enabled
    if (finalUser.twoFactorEnabled) {
      // Generate temporary token (5 minutes) for 2FA verification
      const tempToken = await TokenService.generateTempToken(finalUser.id, finalUser.username);

      logger.info(`Usuario ${finalUser.id} requiere verificación 2FA`);

      return {
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        requires2FA: true,
        tempToken,
        user: {
          id: finalUser.id,
          username: finalUser.username,
          email: finalUser.email,
          fullName: finalUser.fullName,
          role: finalUser.role,
          publicKey: finalUser.publicKey,
          encryptedPrivateKey: finalUser.encryptedPrivateKey,
          emailVerified: finalUser.emailVerified,
          avatarUrl: finalUser.avatarUrl,
          createdAt: finalUser.createdAt,
          lastLogin: null
        }
      };
    }

    // Generate token pair (access + refresh)
    const tokens = await TokenService.generateTokenPair(
      finalUser.id,
      finalUser.username,
      finalUser.role
    );

    return {
      ...tokens,
      user: {
        id: finalUser.id,
        username: finalUser.username,
        email: finalUser.email,
        fullName: finalUser.fullName,
        role: finalUser.role,
        publicKey: finalUser.publicKey,
        encryptedPrivateKey: finalUser.encryptedPrivateKey,
        emailVerified: finalUser.emailVerified,
        avatarUrl: finalUser.avatarUrl,
        createdAt: finalUser.createdAt,
        lastLogin: null
      }
    };
  }

  /**
   * Validate session token (legacy - for backward compatibility)
   */
  static async validateSession(accessToken: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { accessToken }
    });

    if (!session) {
      return false;
    }

    // Check if access token expired
    if (session.accessTokenExpiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * @deprecated Private key decryption should happen in frontend only
   * Get user's decrypted private key
   * Used when user needs to decrypt files or sign transactions
   */
  static async getPrivateKey(userId: string, password: string): Promise<string> {
    console.warn('AuthService.getPrivateKey is deprecated. Private key decryption should happen in frontend only.');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        encryptedPrivateKey: true,
      }
    });

    if (!user || !user.encryptedPrivateKey) {
      throw new Error('Usuario no encontrado');
    }

    try {
      return KeyManager.decryptPrivateKey(user.encryptedPrivateKey, password);
    } catch (error) {
      throw new Error('Contraseña inválida');
    }
  }

  /**
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey
   * Change user password
   * Re-encrypts private key with new password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    console.warn('AuthService.changePassword is deprecated. Password changes should be handled in frontend.');
    // Validate new password with robust policy
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`Validación de contraseña fallida: ${passwordValidation.errors.join(', ')}`);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // If user has no password hash (wallet-based user), they can't change password
    if (!user.passwordHash) {
      throw new Error('Este usuario no tiene contraseña configurada');
    }

    // Verify current password (support both Argon2id and bcrypt)
    const hashType = Argon2Service.detectHashType(user.passwordHash);
    let isValidPassword = false;

    if (hashType === 'argon2id') {
      isValidPassword = await Argon2Service.verify(user.passwordHash, currentPassword);
    } else if (hashType === 'bcrypt') {
      isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    } else {
      throw new Error('Formato de hash de contraseña inválido');
    }

    if (!isValidPassword) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Decrypt private key with current password
    const privateKey = KeyManager.decryptPrivateKey(
      user.encryptedPrivateKey,
      currentPassword
    );

    // Re-encrypt with new password
    const newEncryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, newPassword);

    // Hash new password with Argon2id
    const newHashedPassword = await Argon2Service.hash(newPassword);

    logger.info(`Usuario ${userId} cambiando contraseña (fortaleza: ${passwordValidation.strength})`);

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHashedPassword,
        encryptedPrivateKey: newEncryptedPrivateKey
      }
    });

    // Invalidate all sessions (force re-login with new password)
    await TokenService.revokeAllUserSessions(userId);

    logger.info(`Contraseña del usuario ${userId} cambiada exitosamente`);
  }

  /**
   * Update user's encrypted private key (for wallet-based users)
   * Called when user changes their encryption password in frontend
   */
  static async updateEncryptedPrivateKey(
    userId: string,
    newEncryptedPrivateKey: string,
    newPublicKey?: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        encryptedPrivateKey: newEncryptedPrivateKey,
        ...(newPublicKey && { publicKey: newPublicKey })
      }
    });

    logger.info(`Clave privada del usuario ${userId} actualizada`);
  }

  /**
   * Logout user by revoking refresh token
   */
  static async logout(refreshToken: string): Promise<void> {
    await TokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    return await TokenService.refreshAccessToken(refreshToken);
  }
}
