import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware para validar el body de la request con un schema Zod
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

        console.log('Error de validación:', validationErrors);

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
 * Middleware para validar params de la request con un schema Zod
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
 * Middleware para validar query params de la request con un schema Zod
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

// ============================================================
// LEGACY: Mantener por compatibilidad con código existente
// ============================================================

/**
 * Request validation helper
 */
export class Validator {
  /**
   * Validate required fields
   */
  static required(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const missing: string[] = [];

      for (const field of fields) {
        if (!req.body[field]) {
          missing.push(field);
        }
      }

      if (missing.length > 0) {
        res.status(400).json({
          error: 'Faltan campos requeridos',
          missing
        });
        return;
      }

      next();
    };
  }

  /**
   * Validate email format
   */
  static isEmail(field: string = 'email') {
    return (req: Request, res: Response, next: NextFunction) => {
      const value = req.body[field];

      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        res.status(400).json({ error: `Formato de email inválido: ${field}` });
        return;
      }

      next();
    };
  }

  /**
   * Validate minimum length
   */
  static minLength(field: string, min: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const value = req.body[field];

      if (value && value.length < min) {
        res.status(400).json({
          error: `${field} debe tener al menos ${min} caracteres`
        });
        return;
      }

      next();
    };
  }

  /**
   * Validate Ethereum address
   */
  static isEthereumAddress(field: string = 'address') {
    return (req: Request, res: Response, next: NextFunction) => {
      const value = req.body[field];

      if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
        res.status(400).json({ error: `Dirección Ethereum inválida: ${field}` });
        return;
      }

      next();
    };
  }

  /**
   * Validate UUID format
   */
  static isUUID(field: string, location: 'body' | 'params' | 'query' = 'params') {
    return (req: Request, res: Response, next: NextFunction) => {
      const value = req[location][field];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (value && !uuidRegex.test(value)) {
        res.status(400).json({ error: `Formato UUID inválido: ${field}` });
        return;
      }

      next();
    };
  }

  /**
   * Validate enum value
   */
  static isEnum(field: string, enumValues: any[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const value = req.body[field];

      if (value && !enumValues.includes(value)) {
        res.status(400).json({
          error: `Valor inválido para ${field}. Debe ser uno de: ${enumValues.join(', ')}`
        });
        return;
      }

      next();
    };
  }

  /**
   * Sanitize input (trim whitespace)
   */
  static sanitize(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = req.body[field].trim();
        }
      }

      next();
    };
  }

  /**
   * Validate file upload
   */
  static validateFile(options: {
    required?: boolean;
    maxSize?: number; // bytes
    allowedTypes?: string[]; // mime types
  } = {}) {
    return (req: Request, res: Response, next: NextFunction) => {
      const file = req.file;

      if (options.required && !file) {
        res.status(400).json({ error: 'El archivo es requerido' });
        return;
      }

      if (file) {
        if (options.maxSize && file.size > options.maxSize) {
          res.status(400).json({
            error: `Archivo demasiado grande. Tamaño máximo: ${options.maxSize / (1024 * 1024)}MB`
          });
          return;
        }

        if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
          res.status(400).json({
            error: `Tipo de archivo inválido. Tipos permitidos: ${options.allowedTypes.join(', ')}`
          });
          return;
        }
      }

      next();
    };
  }
}
