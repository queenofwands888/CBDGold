import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOraclePrices, clearOracleCache } from '../oraclePriceService';

// Mock global fetch
const realFetch = global.fetch;

describe('oraclePriceService', () => {
  beforeEach(() => {
    clearOracleCache();
    global.fetch = realFetch;
  });

  it('returns fallback on network error', async () => {
  const rejectedFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error('net fail'));
    global.fetch = rejectedFetch as unknown as typeof fetch;
    const p = await getOraclePrices('http://fake');
    expect(p.algoUsd).toBeGreaterThan(0);
    expect(p.source.fallback).toBe(true);
  });

  it('returns live prices when backend responds', async () => {
    const payload = { prices: { ALGO: 0.5, HEMP: 0.0002, WEED: 0.00009, USDC: 1 } };
    const resolvedFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    global.fetch = resolvedFetch as unknown as typeof fetch;
    const p = await getOraclePrices('http://fake');
    expect(p.algoUsd).toBe(0.5);
    expect(p.hempUsd).toBe(0.0002);
    expect(p.weedUsd).toBe(0.00009);
    expect(p.source.backend).toBe(true);
  });

  it('caches within TTL', async () => {
    const payload = { prices: { ALGO: 0.3, HEMP: 0.00015, WEED: 0.00007 } };
  const mock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    global.fetch = mock as unknown as typeof fetch;
    const a = await getOraclePrices('http://fake');
    const b = await getOraclePrices('http://fake');
    expect(mock).toHaveBeenCalledTimes(1);
    expect(a.algoUsd).toBe(0.3);
    expect(b.algoUsd).toBe(0.3);
  });
});
