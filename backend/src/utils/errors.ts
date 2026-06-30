/**
 * Clases de error personalizadas.
 * Estandarizan el manejo de errores en toda la aplicación.
 */

/**
 * Error lanzado cuando un recurso solicitado no se encuentra.
 *
 * @param resource - Nombre del recurso no encontrado.
 * @param id - Identificador opcional del recurso.
 */
export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` con id ${id}` : ''} no encontrado`);
    this.name = 'NotFoundError';
  }
}

/**
 * Error lanzado ante problemas de autenticación o autorización.
 *
 * @param message - Mensaje descriptivo del error (por defecto: `'Acceso no autorizado'`).
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Acceso no autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error lanzado cuando los datos proporcionados no superan la validación.
 *
 * @param message - Mensaje descriptivo del error.
 * @param field - Nombre del campo que generó el error, si aplica.
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
 * Error lanzado durante operaciones relacionadas con la blockchain.
 *
 * @param message - Mensaje descriptivo del error.
 * @param transactionHash - Hash de la transacción asociada, si existe.
 * @param code - Código de error específico, si existe.
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
 * Error lanzado cuando se detecta un conflicto, por ejemplo, porque el recurso ya existe.
 *
 * @param message - Mensaje descriptivo del error.
 * @param field - Campo que causó el conflicto, si aplica.
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
 * Error lanzado cuando un servicio externo (blockchain, IPFS, BD) no está disponible.
 * El cliente puede distinguir entre "sin permiso" y "servicio caído".
 *
 * @param message - Mensaje descriptivo del error.
 * @param service - Nombre del servicio no disponible.
 */
export class ServiceUnavailableError extends Error {
  public service?: string;

  constructor(message: string, service?: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
    this.service = service;
  }
}


