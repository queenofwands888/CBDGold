import '../../test/setupGlobalPolyfill';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOraclePrices, clearOracleCache } from '../oraclePriceService';

// Mock global fetch
const realFetch = global.fetch;

describe('oraclePriceService', () => {
  beforeEach(() => {
    clearOracleCache();
    global.fetch = realFetch as any; // reset
  });

  it('returns fallback on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('net fail')) as any;
    const p = await getOraclePrices('http://fake');
    expect(p.algoUsd).toBeGreaterThan(0);
    expect(p.source.fallback).toBe(true);
  });

  it('returns live prices when backend responds', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ prices: { ALGO: 0.5, HEMP: 0.0002, WEED: 0.00009, USDC: 1 } }) }) as any;
    const p = await getOraclePrices('http://fake');
    expect(p.algoUsd).toBe(0.5);
    expect(p.hempUsd).toBe(0.0002);
    expect(p.weedUsd).toBe(0.00009);
    expect(p.source.backend).toBe(true);
  });

  it('caches within TTL', async () => {
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ prices: { ALGO: 0.3, HEMP: 0.00015, WEED: 0.00007 } }) });
    global.fetch = mock as any;
    const a = await getOraclePrices('http://fake');
    const b = await getOraclePrices('http://fake');
    expect(mock).toHaveBeenCalledTimes(1);
    expect(a.algoUsd).toBe(0.3);
    expect(b.algoUsd).toBe(0.3);
  });
});
