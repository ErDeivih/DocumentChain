import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { JWT_SECRET } from '../config/jwt';

const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 días
const TEMP_TOKEN_EXPIRY = '5m';     // 5 minutos (para 2FA)

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TokenService {
  /**
   * Generar par de tokens (access + refresh)
   */
  static async generateTokenPair(
    userId: string,
    username: string,
    role: string
  ): Promise<TokenPair> {
    const sessionId = uuidv4();

    // Generar access token (corta duración)
    const accessToken = jwt.sign(
      { userId, username, role, sessionId },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Generar refresh token (larga duración)
    const refreshToken = jwt.sign(
      { userId, sessionId },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    const now = new Date();
    const accessTokenExpiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 min
    const refreshTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

    // Guardar sesión en BD
    await prisma.session.create({
      data: {
        userId,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        lastUsedAt: now
      }
    });

    logger.info('Par de tokens generado', { userId, sessionId });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 900 segundos = 15 minutos
    };
  }

  /**
   * Refrescar access token usando refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<Omit<TokenPair, 'refreshToken'>> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

      // Buscar sesión válida
      const session = await prisma.session.findFirst({
        where: {
          refreshToken,
          refreshTokenExpiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!session) {
        throw new Error('Refresh token inválido o expirado');
      }

      // Generar nuevo access token
      const newAccessToken = jwt.sign(
        {
          userId: session.userId,
          username: session.user.username,
          role: session.user.role,
          sessionId: decoded.sessionId
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );

      const newAccessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Actualizar sesión
      await prisma.session.update({
        where: { id: session.id },
        data: {
          accessToken: newAccessToken,
          accessTokenExpiresAt: newAccessTokenExpiresAt,
          lastUsedAt: new Date()
        }
      });

      logger.info('Token de acceso refrescado', { userId: session.userId });

      return {
        accessToken: newAccessToken,
        expiresIn: 900
      };
    } catch (error) {
      logger.error('Error al refrescar token', { error });
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Revocar refresh token (logout)
   */
  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    const result = await prisma.session.deleteMany({
      where: { refreshToken }
    });

    logger.info('Refresh token revocado', { count: result.count });
  }

  /**
   * Revocar access token (logout alternativo)
   */
  static async revokeAccessToken(accessToken: string): Promise<void> {
    const result = await prisma.session.deleteMany({
      where: { accessToken }
    });

    logger.info('Token de acceso revocado', { count: result.count });
  }

  /**
   * Limpiar tokens expirados (cron job)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        refreshTokenExpiresAt: { lt: new Date() }
      }
    });

    logger.info('Tokens expirados limpiados', { count: result.count });
    return result.count;
  }

  /**
   * Revocar todas las sesiones de un usuario
   */
  static async revokeAllUserSessions(userId: string): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: { userId }
    });

    logger.info('Todas las sesiones de usuario revocadas', { userId, count: result.count });
    return result.count;
  }

  /**
   * Generar token temporal para 2FA (5 minutos)
   * No se guarda en BD, solo se usa para verificar 2FA
   */
  static async generateTempToken(
    userId: string,
    username: string
  ): Promise<string> {
    const tempToken = jwt.sign(
      {
        userId,
        username,
        type: '2fa-temp',
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: TEMP_TOKEN_EXPIRY }
    );

    logger.debug('Token temporal 2FA generado', { userId });

    return tempToken;
  }

  /**
   * Verificar token temporal de 2FA
   * Retorna payload si es válido
   */
  static verifyTempToken(tempToken: string): { userId: string; username: string } {
    try {
      const decoded = jwt.verify(tempToken, JWT_SECRET) as any;

      if (decoded.type !== '2fa-temp') {
        throw new Error('Tipo de token inválido');
      }

      return {
        userId: decoded.userId,
        username: decoded.username
      };
    } catch (error) {
      logger.error('Error al verificar token temporal', { error });
      throw new Error('Token temporal inválido o expirado');
    }
  }
}
