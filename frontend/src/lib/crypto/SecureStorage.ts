/**
 * @fileoverview SecureStorage - Almacenamiento seguro en memoria de claves privadas.
 *
 * Gestiona el almacenamiento temporal de claves privadas en memoria con
 * mecanismos de auto-eliminación, reducción de tiempo de vida cuando la
 * pestaña está oculta y limpieza ante el cierre de la ventana.
 */

/**
 * Entrada de caché para una clave privada almacenada en memoria.
 */
export interface KeyCacheEntry {
  /** Clave privada como CryptoKey. */
  key: CryptoKey;
  /** Marca de tiempo de la última actividad (ms desde epoch). */
  timestamp: number;
  /** Identificador del temporizador de auto-eliminación. */
  timeoutId: ReturnType<typeof setTimeout> | null;
}

/**
 * Almacenamiento seguro en memoria para claves privadas.
 *
 * Implementa:
 * - Auto-eliminación tras un tiempo de inactividad configurable.
 * - Reducción de tiempos de espera cuando la pestaña del navegador está oculta.
 * - Limpieza completa ante el evento `beforeunload`.
 */
export class SecureStorage {
  private static readonly DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
  private static readonly REDUCED_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos cuando está oculta

  private static privateKeyCache = new Map<string, KeyCacheEntry>();
  private static timeoutMs = SecureStorage.DEFAULT_TIMEOUT_MS;
  private static isVisibilityListenerSetup = false;
  private static isBeforeUnloadListenerSetup = false;

  /**
   * Configura los listeners de visibilidad de documento y cierre de ventana.
   */
  private static setupListeners(): void {
    if (!this.isVisibilityListenerSetup) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      this.isVisibilityListenerSetup = true;
    }

    if (!this.isBeforeUnloadListenerSetup) {
      window.addEventListener('beforeunload', this.clearAll.bind(this));
      this.isBeforeUnloadListenerSetup = true;
    }
  }

  /**
   * Maneja los cambios de visibilidad de la pestaña.
   * Reduce los tiempos de espera cuando la pestaña está oculta.
   */
  private static handleVisibilityChange(): void {
    if (document.hidden) {
      // Reducir tiempos de espera cuando la pestaña está oculta
      this.reduceTimeouts(this.REDUCED_TIMEOUT_MS);
    }
  }

  /**
   * Almacena una clave privada en memoria.
   *
   * @param userId - Identificador del usuario.
   * @param key - Clave privada a almacenar.
   * @param customTimeout - Tiempo de espera personalizado en milisegundos (opcional).
   */
  static storePrivateKey(userId: string, key: CryptoKey, customTimeout?: number): void {
    this.setupListeners();

    // Eliminar entrada existente si la hay
    if (this.privateKeyCache.has(userId)) {
      const existing = this.privateKeyCache.get(userId)!;
      if (existing.timeoutId) {
        clearTimeout(existing.timeoutId);
      }
    }

    const timeout = customTimeout || this.timeoutMs;

    // Crear temporizador de auto-eliminación
    const timeoutId = setTimeout(() => {
      this.clearPrivateKey(userId);
    }, timeout);

    // Almacenar la clave
    this.privateKeyCache.set(userId, {
      key,
      timestamp: Date.now(),
      timeoutId,
    });
  }

  /**
   * Obtiene una clave privada de la memoria.
   *
   * Al acceder, reinicia el temporizador de inactividad.
   *
   * @param userId - Identificador del usuario.
   * @returns Clave privada o `null` si no existe o ha expirado.
   */
  static getPrivateKey(userId: string): CryptoKey | null {
    const entry = this.privateKeyCache.get(userId);

    if (!entry) {
      return null;
    }

    // Reiniciar temporizador al acceder (refresco basado en actividad)
    this.refreshTimeout(userId);

    return entry.key;
  }

  /**
   * Verifica si existe una clave privada en memoria para un usuario.
   * @param userId - Identificador del usuario.
   * @returns `true` si la clave existe.
   */
  static hasPrivateKey(userId: string): boolean {
    return this.privateKeyCache.has(userId);
  }

  /**
   * Elimina una clave privada específica de la memoria.
   * @param userId - Identificador del usuario.
   */
  static clearPrivateKey(userId: string): void {
    const entry = this.privateKeyCache.get(userId);

    if (entry) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId);
      }
      this.privateKeyCache.delete(userId);
    }
  }

  /**
   * Elimina todas las claves privadas de la memoria.
   */
  static clearAll(): void {
    for (const [_userId, entry] of this.privateKeyCache) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId);
      }
    }
    this.privateKeyCache.clear();
  }

  /**
   * Refresca el temporizador de una clave almacenada.
   * @param userId - Identificador del usuario.
   */
  private static refreshTimeout(userId: string): void {
    const entry = this.privateKeyCache.get(userId);

    if (!entry) {
      return;
    }

    // Eliminar temporizador existente
    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }

    // Establecer nuevo temporizador
    entry.timeoutId = setTimeout(() => {
      this.clearPrivateKey(userId);
    }, this.timeoutMs);

    // Actualizar marca de tiempo
    entry.timestamp = Date.now();
  }

  /**
   * Reduce los tiempos de espera de todas las claves almacenadas.
   *
   * Útil cuando la pestaña del navegador pasa a segundo plano.
   *
   * @param newTimeout - Nuevo tiempo de espera en milisegundos.
   */
  static reduceTimeouts(newTimeout: number): void {
    for (const [userId, entry] of this.privateKeyCache) {
      const elapsed = Date.now() - entry.timestamp;
      const remaining = newTimeout - elapsed;

      if (remaining <= 0) {
        // Ya se ha superado el tiempo reducido, eliminar inmediatamente
        this.clearPrivateKey(userId);
      } else {
        // Actualizar temporizador
        if (entry.timeoutId) {
          clearTimeout(entry.timeoutId);
        }
        entry.timeoutId = setTimeout(() => {
          this.clearPrivateKey(userId);
        }, remaining);
      }
    }
  }

  /**
   * Establece el tiempo de espera predeterminado para todas las claves.
   * @param timeoutMs - Tiempo de espera en milisegundos.
   */
  static setDefaultTimeout(timeoutMs: number): void {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Obtiene el tiempo restante antes de que una clave sea eliminada.
   * @param userId - Identificador del usuario.
   * @returns Tiempo restante en milisegundos, o `0` si la clave no existe.
   */
  static getTimeRemaining(userId: string): number {
    const entry = this.privateKeyCache.get(userId);

    if (!entry) {
      return 0;
    }

    const elapsed = Date.now() - entry.timestamp;
    return Math.max(0, this.timeoutMs - elapsed);
  }

  /**
   * Obtiene los identificadores de todos los usuarios con claves almacenadas.
   * @returns Array de identificadores de usuario.
   */
  static getStoredUserIds(): string[] {
    return Array.from(this.privateKeyCache.keys());
  }

  /**
   * Verifica si el almacenamiento está vacío.
   * @returns `true` si no hay claves almacenadas.
   */
  static isEmpty(): boolean {
    return this.privateKeyCache.size === 0;
  }

  /**
   * Obtiene el número de claves almacenadas actualmente.
   * @returns Número de claves en memoria.
   */
  static size(): number {
    return this.privateKeyCache.size;
  }
}

export default SecureStorage;
