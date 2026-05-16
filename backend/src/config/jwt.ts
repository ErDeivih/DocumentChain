import jwt from 'jsonwebtoken';
import { env } from './env';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

/**
 * Interfaz que representa la carga útil (payload) de un token JWT.
 */
export interface JWTPayload {
  /** Identificador único del usuario. */
  userId: string;
  /** Nombre de usuario. */
  username: string;
  /** Rol asignado al usuario. */
  role: string;
}

/**
 * Genera un token JWT para un usuario autenticado.
 *
 * @param payload - Datos del usuario a codificar dentro del token.
 * @returns Cadena del token JWT firmado.
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verifica y decodifica un token JWT.
 *
 * @param token - Cadena del token JWT a verificar.
 * @returns Carga útil (payload) decodificada.
 * @throws Error si el token es inválido o ha expirado.
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Decodifica un token JWT sin verificar su firma (útil para depuración).
 *
 * @param token - Cadena del token JWT a decodificar.
 * @returns Carga útil decodificada, o `null` si no se puede decodificar.
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

export { JWT_SECRET };
