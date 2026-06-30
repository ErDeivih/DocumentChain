/**
 * @fileoverview SecureStorage - Almacenamiento seguro en memoria de claves privadas.
 *
 * Gestiona el almacenamiento temporal de claves privadas en memoria con
 * limpieza ante el cierre de la ventana.
 */

export interface KeyCacheEntry {
  key: CryptoKey;
  timestamp: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

export class SecureStorage {
  private static privateKeyCache = new Map<string, KeyCacheEntry>();

  static clearAll(): void {
    for (const [, entry] of this.privateKeyCache) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId);
      }
    }
    this.privateKeyCache.clear();
  }
}

export default SecureStorage;
