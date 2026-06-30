import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/jwt';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';
import { env } from '../config/env';

const ACCESS_TOKEN_EXPIRY = env.JWT_EXPIRES_IN as StringValue;
const REFRESH_TOKEN_EXPIRY = env.JWT_REFRESH_EXPIRES_IN as StringValue;

function parseDuration(dur: string): number {
  const match = dur.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 15 * 60 * 1000;
  const n = parseInt(match[1]);
  switch (match[2]) {
    case 's': return n * 1000;
    case 'm': return n * 60 * 1000;
    case 'h': return n * 3600 * 1000;
    case 'd': return n * 86400 * 1000;
    default: return 15 * 60 * 1000;
  }
}

/**
 * Payload contenido en los tokens JWT.
 * @property userId - ID del usuario
 * @property username - Nombre de usuario
 * @property role - Rol del usuario en el sistema
 */
export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * Payload verificado de un token JWT completo.
 * @property userId - ID del usuario
 * @property sessionId - ID de la sesión
 * @property username - Nombre de usuario
 * @property role - Rol del usuario en el sistema
 * @property iat - Timestamp de emisión
 * @property exp - Timestamp de expiración
 */
export interface JwtPayload {
  userId: string;
  sessionId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Par de tokens generados durante la autenticación.
 * @property accessToken - Token de acceso de corta duración
 * @property refreshToken - Token de refresco de larga duración
 * @property expiresIn - Tiempo de expiración del access token en segundos
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Servicio de generación, refresco y revocación de tokens JWT.
 * Gestiona sesiones de usuario mediante access tokens y refresh tokens.
 */
export class TokenService {
  /**
   * Genera un nuevo par de tokens JWT (access + refresh) para un usuario.
   *
   * @param userId - ID del usuario propietario de los tokens.
   * @param username - Nombre de usuario.
   * @param role - Rol del usuario en el sistema.
   * @returns Par de tokens con access token, refresh token y tiempo de expiración en segundos.
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
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    const now = new Date();
    const accessTokenExpiresAt = new Date(now.getTime() + parseDuration(ACCESS_TOKEN_EXPIRY));
    const refreshTokenExpiresAt = new Date(now.getTime() + parseDuration(REFRESH_TOKEN_EXPIRY));

    // Guardar sesión en BD
    await prisma.session.create({
      data: {
        userId,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      }
    });

    logger.info('Par de tokens generado', { userId, sessionId });

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(parseDuration(ACCESS_TOKEN_EXPIRY) / 1000)
    };
  }

  /**
   * Refrescar access token usando refresh token.
   * Aplica rotación: genera un nuevo refresh token e invalida el anterior.
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;

      // Buscar sesión válida
      const session = await prisma.session.findFirst({
        where: {
          refreshToken,
          refreshTokenExpiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!session) {
        throw new UnauthorizedError('Refresh token inválido o expirado');
      }

      const sessionId = decoded.sessionId;

      // Generar nuevo access token (15 min)
      const newAccessToken = jwt.sign(
        {
          userId: session.userId,
          username: session.user.username,
          role: session.user.role,
          sessionId
        },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );

      // Generar nuevo refresh token (7 días) — rotación
      const newRefreshToken = jwt.sign(
        { userId: session.userId, sessionId },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
      );

      const now = new Date();
      const newAccessTokenExpiresAt = new Date(now.getTime() + parseDuration(ACCESS_TOKEN_EXPIRY));
      const newRefreshTokenExpiresAt = new Date(now.getTime() + parseDuration(REFRESH_TOKEN_EXPIRY));

      // Actualizar sesión con ambos tokens nuevos (atómico: solo si el refresh token no ha cambiado)
      const updateResult = await prisma.session.updateMany({
        where: {
          id: session.id,
          refreshToken, // solo actualiza si el token sigue siendo el mismo
        },
        data: {
          accessToken: newAccessToken,
          accessTokenExpiresAt: newAccessTokenExpiresAt,
          refreshToken: newRefreshToken,
          refreshTokenExpiresAt: newRefreshTokenExpiresAt,
        }
      });

      if (updateResult.count === 0) {
        throw new ConflictError('Refresh token ya fue utilizado');
      }

      logger.info('Token refrescado con rotación', { userId: session.userId, sessionId });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: Math.floor(parseDuration(ACCESS_TOKEN_EXPIRY) / 1000)
      };
    } catch (error) {
      logger.error('Error al refrescar token', { error });
      throw new UnauthorizedError('Refresh token inválido');
    }
  }

  /**
   * Revocar refresh token (logout).
   * @param refreshToken - Token de refresco a revocar.
   */
  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    const result = await prisma.session.deleteMany({
      where: { refreshToken }
    });

    logger.info('Refresh token revocado', { count: result.count });
  }

  /**
   * Limpiar tokens expirados (cron job).
   * @returns Número de sesiones eliminadas.
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
   * Revocar todas las sesiones de un usuario.
   * @param userId - ID del usuario cuyas sesiones se revocarán.
   * @returns Número de sesiones revocadas.
   */
  static async revokeAllUserSessions(userId: string): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: { userId }
    });

    logger.info('Todas las sesiones de usuario revocadas', { userId, count: result.count });
    return result.count;
  }
}
