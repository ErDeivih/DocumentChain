/**
 * Clases de Error Personalizadas
 * Estandariza el manejo de errores en toda la aplicación
 */

/**
 * Error cuando un recurso no es encontrado
 */
export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` con id ${id}` : ''} no encontrado`);
    this.name = 'NotFoundError';
  }
}

/**
 * Error de autenticación/autorización
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Acceso no autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error de validación de datos
 */
export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Error relacionado con operaciones blockchain
 */
export class BlockchainError extends Error {
  public transactionHash?: string;
  public code?: string;

  constructor(
    message: string,
    transactionHash?: string,
    code?: string
  ) {
    super(message);
    this.name = 'BlockchainError';
    this.transactionHash = transactionHash;
    this.code = code;
  }
}

/**
 * Error relacionado con operaciones IPFS
 */
export class IPFSError extends Error {
  public cid?: string;

  constructor(message: string, cid?: string) {
    super(message);
    this.name = 'IPFSError';
    this.cid = cid;
  }
}

/**
 * Error de conflicto (recurso ya existe)
 */
export class ConflictError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ConflictError';
    this.field = field;
  }
}

/**
 * Error de límite excedido (rate limit, tamaño de archivo, etc.)
 */
export class LimitExceededError extends Error {
  public limit?: number;
  public current?: number;

  constructor(message: string, limit?: number, current?: number) {
    super(message);
    this.name = 'LimitExceededError';
    this.limit = limit;
    this.current = current;
  }
}
