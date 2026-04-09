import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de paginación para estandarizar queries de listados
 * Elimina código duplicado de parsing en controllers
 */
export function paginationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
  
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };
  
  next();
}

// Extender Express Request type
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
}
