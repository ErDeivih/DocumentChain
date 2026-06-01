/**
 * Ampliación de tipos para Express que simplifica los tipos de los parámetros.
 * Garantiza que los valores de `req.params` sean siempre tratados como cadenas,
 * en lugar de `string | string[]`.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

declare global {
  namespace Express {
    export interface Request {
      params: Record<string, string>;
      user?: import('../config/jwt').JWTPayload;
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
}

export {};
