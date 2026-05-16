import argon2 from 'argon2';
import logger from '../utils/logger';

/**
 * Argon2Service - Password Hashing con Argon2id
 * 
 * Implementa el algoritmo Argon2id recomendado por:
 * - OWASP Password Storage Cheat Sheet 2024
 * - NIST SP 800-63B (Digital Identity Guidelines)
 * - RFC 9106 (Argon2 Memory-Hard Function)
 * 
 * Ventajas sobre bcrypt/PBKDF2:
 * - 200x más resistente a ataques GPU/ASIC
 * - Memoria intensivo (dificulta paralelización)
 * - Resistente a side-channel attacks
 * - Ganador Password Hashing Competition 2015
 * 
 * Configuración:
 * - Type: argon2id (híbrido data-dependent + data-independent)
 * - Memory Cost: 64 MB (dificulta ataques GPU)
 * - Time Cost: 3 iteraciones
 * - Parallelism: 4 threads
 * - Hash Length: 32 bytes (256 bits)
 */

/**
 * Configuración del algoritmo Argon2.
 * @property type - Constante del tipo Argon2 (ej. argon2.argon2id)
 * @property memoryCost - Coste de memoria en KB
 * @property timeCost - Número de iteraciones
 * @property parallelism - Número de hilos paralelos
 * @property hashLength - Longitud del hash en bytes
 */
export interface Argon2Config {
  type: number;        // argon2.argon2id constant
  memoryCost: number;  // KB
  timeCost: number;    // iterations
  parallelism: number; // threads
  hashLength: number;  // bytes
}

/**
 * Tipos de hash soportados para detección y migración.
 */
export type HashType = 'argon2id' | 'argon2i' | 'argon2d' | 'bcrypt' | 'pbkdf2' | 'unknown';

/**
 * Servicio de hashing de contraseñas con Argon2id.
 * Implementa el algoritmo recomendado por OWASP y NIST para el almacenamiento seguro de credenciales.
 */
export class Argon2Service {
  /**
   * Configuración recomendada por OWASP 2024
   * Tiempo de hash: ~100ms en servidor promedio
   */
  private static readonly CONFIG: Argon2Config = {
    type: argon2.argon2id,
    memoryCost: 65536,      // 64 MB RAM
    timeCost: 3,            // 3 iteraciones
    parallelism: 4,         // 4 threads
    hashLength: 32,         // 256 bits
  };

  /**
   * Hash de contraseña con Argon2id
   * 
   * @param password - Contraseña en texto plano
   * @returns Hash en formato PHC: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
   * 
   * @example
   * const hash = await Argon2Service.hash('MySecurePassword123!');
   * // $argon2id$v=19$m=65536,t=3,p=4$randomSalt$hashValue
   */
  static async hash(password: string): Promise<string> {
    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: this.CONFIG.memoryCost,
        timeCost: this.CONFIG.timeCost,
        parallelism: this.CONFIG.parallelism,
        hashLength: this.CONFIG.hashLength,
        raw: false, // Return string, not Buffer
      });

      logger.debug('Contraseña hasheada con Argon2id');
      return hash as string;

    } catch (error) {
      logger.error('Error al hashear contraseña con Argon2id:', error);
      throw new Error('Error al hashear contraseña');
    }
  }

  /**
   * Verificar contraseña contra hash Argon2id
   * 
   * @param hash - Hash almacenado en BD
   * @param password - Contraseña a verificar
   * @returns true si coincide, false si no
   * 
   * @example
   * const isValid = await Argon2Service.verify(storedHash, userPassword);
   * if (isValid) {
   *   // Login exitoso
   * }
   */
  static async verify(hash: string, password: string): Promise<boolean> {
    try {
      const isValid = await argon2.verify(hash, password);
      
      if (isValid) {
        logger.debug('Verificación de contraseña exitosa');
      } else {
        logger.warn('Verificación de contraseña fallida');
      }

      return isValid;

    } catch (error) {
      logger.error('Error al verificar contraseña:', error);
      return false;
    }
  }

  /**
   * Detectar tipo de hash para migración automática
   * 
   * Soporta:
   * - argon2id: $argon2id$...
   * - argon2i: $argon2i$...
   * - argon2d: $argon2d$...
   * - bcrypt: $2a$, $2b$, $2y$
   * - pbkdf2: contiene ':'
   * 
   * @param hash - Hash a detectar
   * @returns Tipo de hash
   * 
   * @example
   * const type = Argon2Service.detectHashType(user.passwordHash);
   * if (type === 'bcrypt') {
   *   // Migrar a Argon2id
   * }
   */
  static detectHashType(hash: string): HashType {
    if (!hash) return 'unknown';

    // Argon2 variants
    if (hash.startsWith('$argon2id$')) return 'argon2id';
    if (hash.startsWith('$argon2i$')) return 'argon2i';
    if (hash.startsWith('$argon2d$')) return 'argon2d';

    // bcrypt
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return 'bcrypt';
    }

    // PBKDF2 (formato: iterations:salt:hash)
    if (hash.includes(':') && hash.split(':').length >= 3) {
      return 'pbkdf2';
    }

    return 'unknown';
  }

  /**
   * Verificar si hash necesita rehash (parámetros obsoletos)
   * 
   * Retorna true si:
   * - No es Argon2id
   * - Usa parámetros más débiles que CONFIG actual
   * 
   * @param hash - Hash a verificar
   * @returns true si necesita rehash
   * 
   * @example
   * if (await Argon2Service.needsRehash(user.passwordHash)) {
   *   // Rehash con nuevos parámetros en próximo login
   * }
   */
  static async needsRehash(hash: string): Promise<boolean> {
    const hashType = this.detectHashType(hash);

    // Si no es Argon2id, necesita rehash
    if (hashType !== 'argon2id') {
      return true;
    }

    try {
      // Verificar si parámetros están obsoletos
      const needsRehash = await argon2.needsRehash(hash, {
        memoryCost: this.CONFIG.memoryCost,
        timeCost: this.CONFIG.timeCost,
        parallelism: this.CONFIG.parallelism,
      });

      return needsRehash;

    } catch (error) {
      logger.error('Error al verificar si hash necesita rehash:', error);
      // En caso de error, asumir que necesita rehash por seguridad
      return true;
    }
  }

  /**
   * Comparar tiempo de hash (benchmarking)
   * Útil para ajustar CONFIG según hardware del servidor
   * 
   * @param password - Contraseña de prueba
   * @returns Tiempo en milisegundos
   * 
   * @example
   * const time = await Argon2Service.benchmark('TestPassword123!');
   * console.log(`Tiempo de hash: ${time}ms`);
   * // Recomendado: 50-200ms
   */
  static async benchmark(password: string = 'BenchmarkPassword123!'): Promise<number> {
    const start = Date.now();
    await this.hash(password);
    const end = Date.now();
    
    const duration = end - start;
    logger.info(`Benchmark Argon2id: ${duration}ms`);
    
    return duration;
  }

  /**
   * Obtener configuración actual
   * 
   * @returns Configuración Argon2id
   */
  static getConfig(): Argon2Config {
    return { ...this.CONFIG };
  }

  /**
   * Generar hash con configuración personalizada
   * ⚠️ Solo usar para testing o casos especiales
   * 
   * @param password - Contraseña
   * @param config - Configuración personalizada
   * @returns Hash
   */
  static async hashWithCustomConfig(
    password: string,
    config: Partial<Argon2Config>
  ): Promise<string> {
    try {
      const options: any = {
        type: config.type !== undefined ? config.type : argon2.argon2id,
        memoryCost: config.memoryCost || this.CONFIG.memoryCost,
        timeCost: config.timeCost || this.CONFIG.timeCost,
        parallelism: config.parallelism || this.CONFIG.parallelism,
        hashLength: config.hashLength || this.CONFIG.hashLength,
        raw: false,
      };
      
      const hash = await argon2.hash(password, options);
      logger.debug('Contraseña hasheada con configuración Argon2id personalizada');
      return hash as unknown as string;

    } catch (error) {
      logger.error('Error al hashear con configuración personalizada:', error);
      throw new Error('Error al hashear contraseña con configuración personalizada');
    }
  }
}
