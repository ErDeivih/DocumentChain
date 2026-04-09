/**
 * SecureStorage - In-memory storage for private keys
 * Keys are stored only in memory and auto-cleared after timeout
 */

export interface KeyCacheEntry {
  key: CryptoKey;
  timestamp: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

/**
 * SecureStorage class for managing private keys in memory
 * Implements auto-clear and visibility-based security
 */
export class SecureStorage {
  private static readonly DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly REDUCED_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes when hidden
  
  private static privateKeyCache = new Map<string, KeyCacheEntry>();
  private static timeoutMs = SecureStorage.DEFAULT_TIMEOUT_MS;
  private static isVisibilityListenerSetup = false;
  private static isBeforeUnloadListenerSetup = false;

  /**
   * Initialize visibility and beforeunload listeners
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
   * Handle visibility change (tab switch)
   */
  private static handleVisibilityChange(): void {
    if (document.hidden) {
      // Reduce timeouts when tab is hidden
      this.reduceTimeouts(this.REDUCED_TIMEOUT_MS);
    }
  }

  /**
   * Store a private key in memory
   * 
   * @param userId User ID
   * @param key Private key to store
   * @param customTimeout Optional custom timeout in ms
   */
  static storePrivateKey(userId: string, key: CryptoKey, customTimeout?: number): void {
    this.setupListeners();

    // Clear existing entry if exists
    if (this.privateKeyCache.has(userId)) {
      const existing = this.privateKeyCache.get(userId)!;
      if (existing.timeoutId) {
        clearTimeout(existing.timeoutId);
      }
    }

    const timeout = customTimeout || this.timeoutMs;
    
    // Create timeout for auto-clear
    const timeoutId = setTimeout(() => {
      this.clearPrivateKey(userId);
      console.log(`[SecureStorage] Private key auto-cleared for user ${userId} after timeout`);
    }, timeout);

    // Store the key
    this.privateKeyCache.set(userId, {
      key,
      timestamp: Date.now(),
      timeoutId,
    });
  }

  /**
   * Get a private key from memory
   * 
   * @param userId User ID
   * @returns Private key or null if not found/expired
   */
  static getPrivateKey(userId: string): CryptoKey | null {
    const entry = this.privateKeyCache.get(userId);
    
    if (!entry) {
      return null;
    }

    // Reset timeout on access (activity-based refresh)
    this.refreshTimeout(userId);
    
    return entry.key;
  }

  /**
   * Check if a private key exists in memory
   * 
   * @param userId User ID
   * @returns True if key exists
   */
  static hasPrivateKey(userId: string): boolean {
    return this.privateKeyCache.has(userId);
  }

  /**
   * Clear a specific private key from memory
   * 
   * @param userId User ID
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
   * Clear all private keys from memory
   */
  static clearAll(): void {
    for (const [_userId, entry] of this.privateKeyCache) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId);
      }
    }
    this.privateKeyCache.clear();
    console.log('[SecureStorage] All private keys cleared');
  }

  /**
   * Refresh the timeout for a key
   * 
   * @param userId User ID
   */
  private static refreshTimeout(userId: string): void {
    const entry = this.privateKeyCache.get(userId);
    
    if (!entry) {
      return;
    }

    // Clear existing timeout
    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }

    // Set new timeout
    entry.timeoutId = setTimeout(() => {
      this.clearPrivateKey(userId);
      console.log(`[SecureStorage] Private key auto-cleared for user ${userId} after timeout`);
    }, this.timeoutMs);

    // Update timestamp
    entry.timestamp = Date.now();
  }

  /**
   * Reduce all timeouts (used when tab becomes hidden)
   * 
   * @param newTimeout New timeout in ms
   */
  static reduceTimeouts(newTimeout: number): void {
    for (const [userId, entry] of this.privateKeyCache) {
      const elapsed = Date.now() - entry.timestamp;
      const remaining = newTimeout - elapsed;

      if (remaining <= 0) {
        // Already exceeded reduced timeout, clear immediately
        this.clearPrivateKey(userId);
      } else {
        // Update timeout
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
   * Set the default timeout for all keys
   * 
   * @param timeoutMs Timeout in milliseconds
   */
  static setDefaultTimeout(timeoutMs: number): void {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Get the time remaining before a key is cleared
   * 
   * @param userId User ID
   * @returns Time remaining in ms, or 0 if key doesn't exist
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
   * Get all user IDs that have keys stored
   * 
   * @returns Array of user IDs
   */
  static getStoredUserIds(): string[] {
    return Array.from(this.privateKeyCache.keys());
  }

  /**
   * Check if storage is empty
   * 
   * @returns True if no keys are stored
   */
  static isEmpty(): boolean {
    return this.privateKeyCache.size === 0;
  }

  /**
   * Get the number of keys stored
   * 
   * @returns Number of keys
   */
  static size(): number {
    return this.privateKeyCache.size;
  }
}

export default SecureStorage;
