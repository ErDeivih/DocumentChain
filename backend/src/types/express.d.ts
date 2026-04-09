/**
 * Type augmentation for Express to simplify param types
 * This ensures req.params values are always treated as strings, not string | string[]
 */

declare namespace Express {
  export interface Request {
    params: Record<string, string>;
  }
}

export {};
