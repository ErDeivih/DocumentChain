import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Middleware to check if authenticated user is admin
 */
export async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Acceso denegado - Solo administradores' });
      return;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar estado de administrador' });
  }
}
