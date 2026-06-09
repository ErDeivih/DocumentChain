import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
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
  adminSecret?: string;
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
    avatarUrl: string | null;
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

    // Verificar si el nombre de usuario o email ya existen
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });

    if (existingUser) {
      throw new Error(existingUser.username === username ? 'El nombre de usuario ya existe' : 'El email ya existe');
    }

    // Generar par de claves RSA para cifrado
    const { publicKey, privateKey } = KeyManager.generateKeyPair();

    logger.debug(`[register][service] generated keys for username=${username} publicKeyLen=${publicKey.length}`);

    // Generar clave de recuperación
    const recoveryKey = KeyManager.generateRecoveryKey();
    const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);

    // Cifrar clave privada con la contraseña del usuario
    const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, password);
    
    // Cifrar clave privada con clave de recuperación
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
        email: email.toLowerCase().trim(),
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

    // Enviar email de verificación (sin bloquear)
    emailService.sendVerificationEmail(user.email, user.username, verificationToken)
      .catch((error: any) => {
        logger.error('Error al enviar email de verificación:', error);
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
      throw new Error('Nombre de usuario o contraseña inválidos');
    }

    const finalUser = resolvedUser;

    // Si el usuario no tiene hash de contraseña (usuario basado en wallet), no puede iniciar sesión con contraseña
    if (!finalUser.passwordHash) {
      throw new Error('Este usuario requiere autenticación con wallet');
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

    } else if (hashType === 'bcrypt') {
      isValidPassword = await bcrypt.compare(password, finalUser.passwordHash);
      needsMigration = isValidPassword; // Siempre migrar desde bcrypt

      if (isValidPassword) {
        logger.info(`Usuario ${finalUser.id} usando hash bcrypt heredado, se migrará a Argon2id`);
      }

    } else {
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
        avatarUrl: finalUser.avatarUrl,
        createdAt: finalUser.createdAt,
      }
    };
  }

  /**
   * Cambia la contraseña de un usuario.
   * Descifra la clave privada con la contraseña actual, la recifra con la nueva
   * y actualiza el hash de contraseña en BD.
   * @param userId - UUID del usuario.
   * @param currentPassword - Contraseña actual.
   * @param newPassword - Nueva contraseña.
   * @throws Error si el usuario no existe, no tiene contraseña o la contraseña actual es incorrecta.
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Validar nueva contraseña con política robusta
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

    // Si el usuario no tiene hash de contraseña (usuario basado en wallet), no puede cambiarla
    if (!user.passwordHash) {
      throw new Error('Este usuario no tiene contraseña configurada');
    }

    // Verificar contraseña actual (soporta Argon2id y bcrypt)
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

    // Descifrar clave privada con contraseña actual
    const privateKey = KeyManager.decryptPrivateKey(
      user.encryptedPrivateKey,
      currentPassword
    );

    // Recifrar con nueva contraseña
    const newEncryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, newPassword);

    // Hashear nueva contraseña con Argon2id
    const newHashedPassword = await Argon2Service.hash(newPassword);

    logger.info(`Usuario ${userId} cambiando contraseña (fortaleza: ${passwordValidation.strength})`);

    // Actualizar usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHashedPassword,
        encryptedPrivateKey: newEncryptedPrivateKey
      }
    });

    // Invalidar todas las sesiones (forzar re-login con nueva contraseña)
    await TokenService.revokeAllUserSessions(userId);

    logger.info(`Contraseña del usuario ${userId} cambiada exitosamente`);
  }

  /**
   * Actualiza la clave privada cifrada de un usuario (para usuarios basados en wallet).
   * Se invoca cuando el usuario cambia su contraseña de cifrado en el frontend.
   * @param userId - UUID del usuario.
   * @param newEncryptedPrivateKey - Nueva clave privada cifrada.
   * @param newPublicKey - Nueva clave pública (opcional).
   * @throws Error si el usuario no existe.
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
   * Cierra la sesión de un usuario revocando su refresh token.
   * @param refreshToken - Token de refresco a revocar.
   */
  static async logout(refreshToken: string): Promise<void> {
    await TokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Refresca el access token utilizando un refresh token válido.
   * @param refreshToken - Token de refresco.
   * @returns Nuevo access token y tiempo de expiración.
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    return await TokenService.refreshAccessToken(refreshToken);
  }
}
