/**
 * Ampliación de tipos para Express que simplifica los tipos de los parámetros.
 * Garantiza que los valores de `req.params` sean siempre tratados como cadenas,
 * en lugar de `string | string[]`.
 */

declare namespace Express {
  /**
   * Extensión de la interfaz `Request` de Express para tipar estrictamente los parámetros de ruta.
   */
  export interface Request {
    /**
     * Parámetros de la URL tipados como cadenas de texto plano.
     */
    params: Record<string, string>;
  }
}

export {};
