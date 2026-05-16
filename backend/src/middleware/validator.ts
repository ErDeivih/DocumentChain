import logger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware para validar el cuerpo (body) de la solicitud mediante un esquema Zod.
 *
 * @param schema - Esquema Zod a utilizar para la validación.
 * @returns Middleware de Express que valida `req.body`.
 */
export function validateBody(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        logger.warn('Error de validación:', validationErrors);

        res.status(400).json({
          error: 'Validación fallida',
          details: validationErrors
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Middleware para validar los parámetros de ruta (params) de la solicitud mediante un esquema Zod.
 *
 * @param schema - Esquema Zod a utilizar para la validación.
 * @returns Middleware de Express que valida `req.params`.
 */
export function validateParams(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Parámetros inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Middleware para validar los parámetros de consulta (query) de la solicitud mediante un esquema Zod.
 *
 * @param schema - Esquema Zod a utilizar para la validación.
 * @returns Middleware de Express que valida `req.query`.
 */
export function validateQuery(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedQuery = await schema.parseAsync(req.query);

      Object.keys(req.query).forEach((key) => {
        delete (req.query as Record<string, unknown>)[key];
      });

      Object.assign(req.query as Record<string, unknown>, parsedQuery);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Parámetros de consulta inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        next(error);
      }
    }
  };
}
