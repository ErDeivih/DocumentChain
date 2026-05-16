import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { env } from '../config/env';

const isProduction = env.NODE_ENV === 'production';

/**
 * Resuelve el valor máximo de solicitudes permitidas para un rate limiter,
 * priorizando la variable de entorno correspondiente.
 *
 * @param envVarName - Nombre de la variable de entorno a consultar.
 * @param productionDefault - Valor por defecto en entornos de producción.
 * @param nonProductionDefault - Valor por defecto en entornos no productivos.
 * @returns Número máximo de solicitudes permitidas.
 */
function resolveRateLimitMax(envVarName: string, productionDefault: number, nonProductionDefault: number): number {
  const rawValue = process.env[envVarName];
  const parsedValue = rawValue ? Number(rawValue) : NaN;

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return isProduction ? productionDefault : nonProductionDefault;
}

const uploadRateLimitMax = resolveRateLimitMax('UPLOAD_RATE_LIMIT_MAX', 50, 500);
const generalRateLimitMax = resolveRateLimitMax('GENERAL_RATE_LIMIT_MAX', 100, 2000);
const prepareRateLimitMax = resolveRateLimitMax('PREPARE_RATE_LIMIT_MAX', 10, 100);
const confirmRateLimitMax = resolveRateLimitMax('CONFIRM_RATE_LIMIT_MAX', 15, 150);

/**
 * Rate limiter para endpoints de autenticación (estricto).
 * Protege contra ataques de fuerza bruta limitando los intentos de inicio de sesión.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 intentos por ventana (testing)
  message: {
    error: 'Demasiados intentos de autenticación. Por favor, inténtelo de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request) => {
    // Combinar IP + username para mayor seguridad
    return req.ip + (req.body?.username || '');
  }
});

/**
 * Rate limiter para la subida de documentos (moderado).
 * Previene el abuso del almacenamiento limitando la cantidad de archivos subidos por hora.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: uploadRateLimitMax,
  message: {
    error: `Límite de subida excedido. Máximo ${uploadRateLimitMax} documentos por hora.`
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.userId || req.ip || 'unknown'
});

/**
 * Rate limiter general para todas las rutas de la API (flexible).
 * Ofrece protección básica contra ataques de denegación de servicio (DoS).
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: generalRateLimitMax,
  message: {
    error: 'Demasiadas solicitudes. Por favor, reduzca la velocidad.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Auditoría pública usa su propio bucket para no agotarse por tráfico previo de la app.
    if (req.originalUrl?.startsWith('/api/audit')) {
      return true;
    }

    // Saltear rate limit para usuarios admin
    return req.user?.role === 'ADMIN';
  },
  keyGenerator: (req: Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return req.ip || 'unknown';
  }
});

/**
 * Rate limiter para auditoría pública (amplio).
 * Permite la exploración pública de registros sin verse afectada por el tráfico general de la aplicación.
 */
export const auditLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 300, // 300 consultas por minuto
  message: {
    error: 'Demasiadas consultas de auditoría. Por favor, reduzca la velocidad.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para operaciones blockchain (muy restrictivo).
 * Limita las consultas a la cadena de bloques dado su elevado coste computacional.
 */
export const blockchainLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // 20 requests a blockchain por 5 min
  message: {
    error: 'Límite de consultas blockchain excedido. Por favor, espere.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para operaciones de compartir documentos (moderado).
 * Restringe la cantidad de acciones de compartir que un usuario puede realizar por hora.
 */
export const shareLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 30, // 30 operaciones de compartir por hora
  message: {
    error: 'Límite de operaciones de compartir excedido. Por favor, inténtelo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para endpoints de preparación (restrictivo).
 * Previene el abuso del patrón prepare/confirm limitando la cantidad de transacciones
 * que un usuario puede preparar por minuto.
 */
export const prepareLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: prepareRateLimitMax,
  message: {
    error: 'Demasiadas solicitudes de preparación. Por favor espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limit for admin users
    return req.user?.role === 'ADMIN';
  },
  keyGenerator: (req: Request) => req.user?.userId || req.ip || 'unknown'
});

/**
 * Rate limiter para endpoints de confirmación (moderado).
 * Permite un límite ligeramente superior al de preparación, ya que las confirmaciones
 * deben seguir a las solicitudes de preparación.
 */
export const confirmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: confirmRateLimitMax,
  message: {
    error: 'Demasiadas solicitudes de confirmación. Por favor espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.user?.role === 'ADMIN';
  },
  keyGenerator: (req: Request) => req.user?.userId || req.ip || 'unknown'
});
