import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import prisma from '../config/database';
import { isAdmin } from './isAdmin';

/**
 * Middleware para verificar token JWT y adjuntar usuario a la petición
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No se ha proporcionado token' });
      return;
    }

    const accessToken = authHeader.substring(7); // Eliminar prefijo 'Bearer '

    // Verificar token
    const payload = verifyToken(accessToken);

    // Verificar si la sesión existe y es válida
    const session = await prisma.session.findUnique({
      where: { accessToken }
    });

    if (!session || session.accessTokenExpiresAt < new Date()) {
      res.status(401).json({ error: 'Sesión inválida o expirada' });
      return;
    }

    // Adjuntar usuario a la petición
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware para verificar si el usuario tiene rol de administrador
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Se requiere autenticación' });
    return;
  }

  isAdmin(req, res, next);
}
