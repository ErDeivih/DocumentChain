import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de paginación para estandarizar queries de listados.
 * Elimina código duplicado de parsing en controllers añadiendo un objeto
 * `pagination` a la solicitud con los valores calculados de página, límite y desplazamiento.
 *
 * @param req - Objeto de solicitud de Express.
 * @param res - Objeto de respuesta de Express.
 * @param next - Función para pasar el control al siguiente middleware.
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

/**
 * Extensión del tipo `Request` de Express para incluir los parámetros de paginación.
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Parámetros de paginación calculados por el middleware.
       */
      pagination?: {
        /** Número de página actual (empieza en 1). */
        page: number;
        /** Cantidad máxima de elementos por página. */
        limit: number;
        /** Número de elementos a omitir desde el inicio del conjunto de resultados. */
        skip: number;
      };
    }
  }
}
