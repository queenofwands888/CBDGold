import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../data');
const STORAGE_FILE = process.env.CBDGOLD_SHIPMENTS_FILE
  ? path.resolve(process.env.CBDGOLD_SHIPMENTS_FILE)
  : path.join(DEFAULT_DATA_DIR, 'shipments.json');
const STORAGE_DIR = path.dirname(STORAGE_FILE);

const writeQueue = new Map();

async function ensureStorage() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  try {
    await fs.access(STORAGE_FILE, fs.constants.F_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(STORAGE_FILE, '[]', 'utf8');
      logger.info('shipping-store: created storage file', {
        storageFile: STORAGE_FILE,
      });
    } else {
      throw error;
    }
  }
}

async function readStore() {
  await ensureStorage();
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    logger.warn('shipping-store: storage contained non-array payload, resetting', {
      storageFile: STORAGE_FILE,
    });
    return [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    logger.error('shipping-store: failed to read store', {
      error: error.message,
      storageFile: STORAGE_FILE,
    });
    throw error;
  }
}

async function writeStore(entries) {
  const previous = writeQueue.get(STORAGE_FILE) || Promise.resolve();
  const next = previous.then(async () => {
    const payload = `${JSON.stringify(entries, null, 2)}\n`;
    await fs.writeFile(STORAGE_FILE, payload, 'utf8');
  });

  const wrapped = next
    .catch(error => {
      logger.error('shipping-store: write failed', {
        error: error.message,
        storageFile: STORAGE_FILE,
      });
      throw error;
    })
    .finally(() => {
      if (writeQueue.get(STORAGE_FILE) === wrapped) {
        writeQueue.delete(STORAGE_FILE);
      }
    });

  writeQueue.set(STORAGE_FILE, wrapped);
  return wrapped;
}

const sanitizeWallet = (wallet = '') => wallet.replace(/[^A-Z0-9]/gi, '').toUpperCase();

function normalizeEntry(entry) {
  const normalizedWallet = sanitizeWallet(entry.wallet);
  const now = Date.now();
  return {
    id: entry.id || randomUUID(),
    wallet: normalizedWallet,
    prizeId: entry.prizeId != null ? Number(entry.prizeId) : null,
    productId: entry.productId ?? null,
    productName: entry.productName || (entry.prizeId ? `Prize ${entry.prizeId}` : 'Mystery Prize'),
    shippingAddress: entry.shippingAddress || 'N/A',
    status: entry.status || 'shipping',
    createdAt: entry.createdAt || now,
    updatedAt: now,
    dispatchTxId: entry.dispatchTxId || null,
    dispatchedAt: entry.dispatchedAt || null,
    metadata: entry.metadata && typeof entry.metadata === 'object' ? entry.metadata : {},
  };
}

export async function recordClaim(payload = {}) {
  const wallet = sanitizeWallet(payload.wallet);
  if (!wallet) {
    throw new Error('Wallet required for shipment record');
  }

  const store = await readStore();
  const entry = normalizeEntry({ ...payload, wallet });

  const matcher = item => {
    if (item.wallet !== wallet || item.status === 'dispatched') {
      return false;
    }

    if (payload.id) {
      return item.id === payload.id;
    }

    if (entry.prizeId != null) {
      return item.prizeId === entry.prizeId;
    }

    if (entry.productId != null) {
      return item.productId === entry.productId;
    }

    return false;
  };

  const existingIdx = store.findIndex(matcher);
  if (existingIdx >= 0) {
    store[existingIdx] = {
      ...store[existingIdx],
      ...entry,
      id: store[existingIdx].id,
      createdAt: store[existingIdx].createdAt,
      updatedAt: Date.now(),
    };
  } else {
    store.push(entry);
  }

  await writeStore(store);
  return { ...entry };
}

export async function getBasketForWallet(wallet) {
  const normalized = sanitizeWallet(wallet);
  if (!normalized) return [];

  const store = await readStore();
  return store
    .filter(item => item.wallet === normalized && item.status !== 'dispatched')
    .map(item => ({ ...item }));
}

export async function markDispatched(wallet, txInfo) {
  const normalized = sanitizeWallet(wallet);
  if (!normalized) {
    throw new Error('Wallet required');
  }

  let providedTxId;
  let entryFilter;

  if (typeof txInfo === 'string') {
    providedTxId = txInfo;
  } else if (txInfo && typeof txInfo === 'object') {
    providedTxId = txInfo.txId ?? txInfo.transactionId ?? null;
    const ids = txInfo.entryId ?? txInfo.entryIds;
    if (Array.isArray(ids)) {
      entryFilter = new Set(ids);
    } else if (ids) {
      entryFilter = new Set([ids]);
    }
  }

  const store = await readStore();
  const now = Date.now();
  let cleared = 0;
  const dispatched = [];

  const updated = store.map(item => {
    if (item.wallet !== normalized || item.status === 'dispatched') {
      return item;
    }

    if (entryFilter && !entryFilter.has(item.id)) {
      return item;
    }

    const updatedItem = {
      ...item,
      status: 'dispatched',
      dispatchTxId: providedTxId || item.dispatchTxId || randomUUID(),
      dispatchedAt: now,
      updatedAt: now,
    };

    cleared += 1;
    dispatched.push(updatedItem);
    return updatedItem;
  });

  if (cleared === 0) {
    return { cleared: 0, dispatched: [] };
  }

  await writeStore(updated);
  logger.info('shipping-store: marked entries dispatched', {
    wallet: normalized,
    cleared,
    filtered: entryFilter ? entryFilter.size : null,
  });

  return { cleared, dispatched };
}

export async function clearDispatchedOlderThan(days = 30) {
  const store = await readStore();
  if (!store.length) return 0;

  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = store.filter(item => item.status !== 'dispatched' || (item.updatedAt ?? 0) > threshold);

  if (filtered.length !== store.length) {
    await writeStore(filtered);
    logger.info('shipping-store: pruned dispatched entries', {
      removed: store.length - filtered.length,
      remaining: filtered.length,
      thresholdDays: days,
      storageFile: STORAGE_FILE,
    });
  }

  return filtered.length;
}

export async function removeEntry(id) {
  if (!id) return false;

  const store = await readStore();
  const next = store.filter(item => item.id !== id);
  if (next.length === store.length) {
    return false;
  }

  await writeStore(next);
  logger.info('shipping-store: removed entry', { id, storageFile: STORAGE_FILE });
  return true;
}
