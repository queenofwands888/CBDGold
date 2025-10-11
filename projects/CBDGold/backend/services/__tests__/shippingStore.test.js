import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DAY_MS = 24 * 60 * 60 * 1000;

let tempDir;
let storageFile;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shipping-store-'));
  storageFile = path.join(tempDir, 'shipments.json');
  process.env.CBDGOLD_SHIPMENTS_FILE = storageFile;
  vi.resetModules();
});

afterEach(async () => {
  delete process.env.CBDGOLD_SHIPMENTS_FILE;
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe('shippingStore', () => {
  it('records claims and retrieves basket for wallet', async () => {
    const store = await import('../shippingStore.js');

    const created = await store.recordClaim({
      wallet: 'addr-123',
      prizeId: 7,
      shippingAddress: '123 Main St',
    });

    expect(created.wallet).toBe('ADDR123');
    expect(created.prizeId).toBe(7);

    const basket = await store.getBasketForWallet('addr-123');
    expect(basket).toHaveLength(1);
    expect(basket[0].wallet).toBe('ADDR123');
    expect(basket[0].status).toBe('shipping');

    const raw = await fs.readFile(storageFile, 'utf8');
    const diskEntries = JSON.parse(raw);
    expect(diskEntries).toHaveLength(1);
    expect(diskEntries[0].wallet).toBe('ADDR123');
  });

  it('marks entries dispatched, prunes old records, and removes by id', async () => {
    const store = await import('../shippingStore.js');

    const claim = await store.recordClaim({
      wallet: 'WALLET-1',
      productId: 'prod-1',
    });

    const dispatchResult = await store.markDispatched('wallet-1', {
      entryId: claim.id,
      txId: 'tx-123',
    });

    expect(dispatchResult.cleared).toBe(1);
    expect(dispatchResult.dispatched).toHaveLength(1);
    expect(dispatchResult.dispatched[0].dispatchTxId).toBe('tx-123');
    expect(dispatchResult.dispatched[0].status).toBe('dispatched');

    // Age the entry so it should be pruned
    const contents = JSON.parse(await fs.readFile(storageFile, 'utf8'));
    contents[0].updatedAt = Date.now() - 35 * DAY_MS;
    await fs.writeFile(storageFile, `${JSON.stringify(contents, null, 2)}\n`, 'utf8');

    const remaining = await store.clearDispatchedOlderThan(30);
    expect(remaining).toBe(0);

    const removed = await store.removeEntry(claim.id);
    expect(removed).toBe(false); // already pruned

    const payload = await fs.readFile(storageFile, 'utf8');
    expect(JSON.parse(payload)).toEqual([]);
  });
});
