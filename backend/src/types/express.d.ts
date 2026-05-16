/**
 * Ampliación de tipos para Express que simplifica los tipos de los parámetros.
 * Garantiza que los valores de `req.params` sean siempre tratados como cadenas,
 * en lugar de `string | string[]`.
 */

declare namespace Express {
  export interface Request {
    params: Record<string, string>;
    user?: {
      userId: string;
      username: string;
      email: string;
      role: string;
      isAdmin?: boolean;
    };
  }
}

export {};
