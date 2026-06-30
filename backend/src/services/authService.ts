import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '../config/database';
import { TokenService, type TokenPair } from './tokenService';
import { Argon2Service } from './argon2Service';
import { validatePassword } from '../validators/passwordPolicy';
import { emailService } from './emailService';
import logger from '../utils/logger';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { env } from '../config/env';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  adminSecret?: string;
  publicKey: string;
  encryptedPrivateKey: string;
  recoveryKeyHash: string;
  encryptedPrivateKeyRecovery: string;
  recoveryKeySalt?: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  recoveryKey?: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string | null;
    role: string;
    publicKey: string;
    encryptedPrivateKey?: string;
    emailVerified: boolean;
    createdAt: Date;
  };
}

/**
 * Servicio de autenticación y gestión de sesiones.
 */
export class AuthService {
  /**
   * Registra un usuario con nombre de usuario/contraseña.
   * Genera un par de claves RSA, cifra la clave privada con la contraseña,
   * hashea la contraseña con Argon2id y crea el registro en BD.
   * @param input - Datos de entrada para el registro.
   * @returns Respuesta de autenticación con tokens, clave de recuperación y datos del usuario.
   * @throws Error si las validaciones fallan o el usuario/email ya existen.
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    const { username, email, password, fullName, adminSecret, publicKey, encryptedPrivateKey, encryptedPrivateKeyRecovery, recoveryKeyHash, recoveryKeySalt } = input;

    // Validar entrada
    if (!username || username.length < 3) {
      throw new ValidationError('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!email || !email.includes('@')) {
      throw new ValidationError('Se requiere un email válido');
    }

    // Validar contraseña con política robusta
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new ValidationError(`Validación de contraseña fallida: ${passwordValidation.errors.join(', ')}`);
    }

    logger.info(`Fortaleza de contraseña: ${passwordValidation.strength} (puntuación: ${passwordValidation.score})`);

    // Validar que el frontend envió las claves criptográficas
    if (!publicKey || !encryptedPrivateKey || !encryptedPrivateKeyRecovery || !recoveryKeyHash) {
      throw new ValidationError('Faltan las claves criptográficas generadas por el cliente');
    }

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

    // Verificar y crear usuario en transacción para evitar race conditions
    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ username }, { email }] }
      });

      if (existingUser) {
        throw new ConflictError('El nombre de usuario o email ya existe');
      }

      return tx.user.create({
        data: {
          id: uuidv4(),
          username,
          email: email.toLowerCase().trim(),
          passwordHash: hashedPassword,
          fullName: fullName || null,
          role: userRole,
          publicKey,
          encryptedPrivateKey,
          recoveryKeyHash,
          encryptedPrivateKeyRecovery,
          recoveryKeySalt: recoveryKeySalt || null
        }
      });
    });

    // Crear token de verificación de email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    if (env.SKIP_EMAIL_VERIFICATION) {
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt,
          verified: true
        }
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });
      logger.info(`Email verification skipped for ${username} (SKIP_EMAIL_VERIFICATION=true)`);
    } else {
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt
        }
      });

      // Enviar email de verificación (sin bloquear)
      emailService.sendVerificationEmail(user.email, user.username, verificationToken)
        .catch((error: any) => {
          logger.error('Error al enviar email de verificación:', error);
        });
    }

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
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      }
    };
  }

  /**
   * Inicia sesión de un usuario existente.
  * Incluye migración automática de bcrypt a Argon2id.
   * @param input - Datos de entrada para el inicio de sesión.
   * @returns Respuesta de autenticación con tokens y datos del usuario.
   * @throws Error si las credenciales son inválidas, el email no está verificado o el usuario requiere wallet.
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    const { identifier, password } = input;
    const trimmed = identifier.trim();

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { username: trimmed }
    });

    // Si no se encontró por username, intentar por email (login mixto)
    const resolvedUser = user ?? await prisma.user.findUnique({ where: { email: trimmed.toLowerCase() } });

    if (!resolvedUser) {
      throw new UnauthorizedError('Nombre de usuario o contraseña inválidos');
    }

    const finalUser = resolvedUser;

    // Si el usuario no tiene hash de contraseña (usuario basado en wallet), no puede iniciar sesión con contraseña
    if (!finalUser.passwordHash) {
      throw new UnauthorizedError('Nombre de usuario o contraseña inválidos');
    }

    // Detectar tipo de hash para migración automática
    const hashType = Argon2Service.detectHashType(finalUser.passwordHash);
    let isValidPassword = false;
    let needsMigration = false;

    if (hashType === 'argon2id') {
      isValidPassword = await Argon2Service.verify(finalUser.passwordHash, password);

      if (isValidPassword) {
        needsMigration = await Argon2Service.needsRehash(finalUser.passwordHash);
      }

    } else {
      logger.error(`Usuario ${finalUser.id} tiene tipo de hash desconocido: ${hashType}`);
      throw new UnauthorizedError('Nombre de usuario o contraseña inválidos');
    }

    if (!isValidPassword) {
      throw new UnauthorizedError('Nombre de usuario o contraseña inválidos');
    }

    // Verificar que el email esté confirmado antes de permitir el acceso
    if (!finalUser.emailVerified) {
      throw new UnauthorizedError('Nombre de usuario o contraseña inválidos');
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
        logger.error(`Error al migrar contraseña de usuario ${finalUser.id} — la migración se reintentará en el próximo inicio de sesión:`, error);
      }
    }

    // Generar par de tokens (acceso + refresco)
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
        createdAt: finalUser.createdAt,
      }
    };
  }

  /**
   * Cambia la contraseña de un usuario.
   * Recibe la clave privada ya re-cifrada por el frontend con la nueva contraseña,
   * verifica la contraseña actual y actualiza el hash y la clave cifrada en BD.
   * Revoca todas las sesiones activas del usuario tras el cambio.
   * @param userId - UUID del usuario.
   * @param currentPassword - Contraseña actual (para verificación).
   * @param newEncryptedPrivateKey - Clave privada re-cifrada con la nueva contraseña.
   * @param newSalt - Nueva sal utilizada para el cifrado de la clave privada.
   * @param newPassword - Nueva contraseña (para validación y hash).
   * @throws Error si el usuario no existe o la contraseña actual es incorrecta.
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newEncryptedPrivateKey: string,
    newSalt: string,
    newPassword: string,
  ): Promise<void> {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError(`Validación de contraseña fallida: ${passwordValidation.errors.join(', ')}`);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!user.passwordHash) {
      throw new ValidationError('Este usuario no tiene contraseña configurada');
    }

    const hashType = Argon2Service.detectHashType(user.passwordHash);
    let isValidPassword = false;

    if (hashType === 'argon2id') {
      isValidPassword = await Argon2Service.verify(user.passwordHash, currentPassword);
    } else {
      throw new ValidationError('Formato de hash de contraseña inválido');
    }

    if (!isValidPassword) {
      throw new UnauthorizedError('La contraseña actual es incorrecta');
    }

    const newPasswordHash = await Argon2Service.hash(newPassword);

    logger.info(`Usuario ${userId} cambiando contraseña (fortaleza: ${passwordValidation.strength})`);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        encryptedPrivateKey: newEncryptedPrivateKey,
      }
    });

    await TokenService.revokeAllUserSessions(userId);

    logger.info(`Contraseña del usuario ${userId} cambiada exitosamente`);
  }

  /**
   * Cierra la sesión de un usuario revocando su refresh token.
   * @param refreshToken - Token de refresco a revocar.
   */
  static async logout(refreshToken: string): Promise<void> {
    await TokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Refresca el access token utilizando un refresh token válido.
   * Aplica rotación: el refresh token antiguo queda invalidado y se emite uno nuevo.
   * @param refreshToken - Token de refresco.
   * @returns Nuevo par de tokens (access + refresh) y tiempo de expiración.
   */
  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    return await TokenService.refreshAccessToken(refreshToken);
  }
}
