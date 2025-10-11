import { logger } from './logger';

const NAMESPACE = 'cbdgold';
const ALLOWED_KEYS = new Set<StorageKey>(['app_state', 'tx_history', 'rate_limits']);
const LEGACY_KEYS: Record<StorageKey, string> = {
  app_state: 'cbdgold_app_state',
  tx_history: 'cbdgold_tx_history',
  rate_limits: 'cbdgold_rate_limits'
};

const memoryFallback = new Map<string, string>();
let storageRef: Storage | null | undefined;

export type StorageKey = 'app_state' | 'tx_history' | 'rate_limits';

const resolveStorage = (): Storage | null => {
  if (storageRef !== undefined) {
    return storageRef;
  }
  if (typeof window === 'undefined') {
    storageRef = null;
    return storageRef;
  }
  try {
    const testKey = `${NAMESPACE}__probe`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    storageRef = window.localStorage;
  } catch (error) {
    logger.warn('LocalStorage unavailable, using in-memory fallback', error);
    storageRef = null;
  }
  return storageRef;
};

const namespacedKey = (key: StorageKey) => `${NAMESPACE}:${key}`;

const computeByteLength = (value: string): number => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.byteLength(value, 'utf8');
  }
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }
  return value.length;
};

const isAllowed = (key: StorageKey): boolean => {
  if (!ALLOWED_KEYS.has(key)) {
    logger.warn('Attempted to access disallowed storage key', key);
    return false;
  }
  return true;
};

const readRaw = (key: StorageKey): string | null => {
  if (!isAllowed(key)) return null;
  const storage = resolveStorage();
  const nsKey = namespacedKey(key);
  let value: string | null = null;
  try {
    value = storage?.getItem(nsKey) ?? null;
  } catch (error) {
    logger.warn('Failed to read from localStorage; falling back to memory cache', error);
  }
  if (!value && memoryFallback.has(nsKey)) {
    value = memoryFallback.get(nsKey) ?? null;
  }
  if (!value) {
    const legacyKey = LEGACY_KEYS[key];
    try {
      const legacyValue = storage?.getItem(legacyKey) ?? null;
      if (legacyValue) {
        value = legacyValue;
        // Migrate legacy key into namespaced storage
        setRaw(key, legacyValue);
        storage?.removeItem(legacyKey);
      }
    } catch (error) {
      logger.warn('Failed to migrate legacy storage key', { key: legacyKey, error });
    }
  }
  return value;
};

const setRaw = (key: StorageKey, serialized: string, maxBytes = 16_384): boolean => {
  if (!isAllowed(key)) return false;
  const byteLength = computeByteLength(serialized);
  if (byteLength > maxBytes) {
    logger.warn('Refusing to persist value that exceeds storage byte budget', { key, byteLength, maxBytes });
    return false;
  }
  const storage = resolveStorage();
  const nsKey = namespacedKey(key);
  try {
    storage?.setItem(nsKey, serialized);
  } catch (error) {
    logger.warn('Failed to persist to localStorage; using in-memory cache', { key, error });
  }
  memoryFallback.set(nsKey, serialized);
  return true;
};

export const secureStorage = {
  getJSON<T>(key: StorageKey): T | null {
    const raw = readRaw(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      logger.warn('Failed to parse stored JSON; clearing entry', { key, error });
      this.remove(key);
      return null;
    }
  },
  setJSON(key: StorageKey, value: unknown, options?: { maxBytes?: number }): boolean {
    try {
      const serialized = JSON.stringify(value);
      const maxBytes = options?.maxBytes ?? 16_384;
      return setRaw(key, serialized, maxBytes);
    } catch (error) {
      logger.warn('Failed to serialise value for storage', { key, error });
      return false;
    }
  },
  remove(key: StorageKey): void {
    if (!isAllowed(key)) return;
    const storage = resolveStorage();
    const nsKey = namespacedKey(key);
    try {
      storage?.removeItem(nsKey);
    } catch (error) {
      logger.warn('Failed to remove stored item; clearing memory cache only', { key, error });
    }
    memoryFallback.delete(nsKey);
  },
  clearNamespace(): void {
    const storage = resolveStorage();
    if (storage) {
      Object.keys(storage)
        .filter(key => key.startsWith(`${NAMESPACE}:`))
        .forEach(key => {
          try { storage.removeItem(key); } catch {}
        });
    }
    memoryFallback.clear();
  }
};
