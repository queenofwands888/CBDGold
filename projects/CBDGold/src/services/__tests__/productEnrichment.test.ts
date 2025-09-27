import { describe, it, expect, vi, beforeEach } from 'vitest';
// @ts-ignore JS module with d.ts
import productService from '../productService';
import * as oracleMod from '../oraclePriceService';

// Helper to access private enrich via fetching fallback with mocked oracle

describe('productService enrichment', () => {
  beforeEach(() => {
    productService.clearCache();
  });

  it('enriches fallback products using oracle rates', async () => {
    vi.spyOn(oracleMod, 'getOraclePrices').mockResolvedValue({
      algoUsd: 0.5,
      hempUsd: 0.0002,
      usdcUsd: 1,
      source: { backend: true, fallback: false },
      lastUpdated: Date.now()
    });
    // Force fetchProducts to fallback path by mocking fetch failing
    global.fetch = vi.fn().mockRejectedValue(new Error('fail')) as any;
    const data = await productService.fetchProducts();
    expect(data.products.length).toBeGreaterThan(0);
    const sample = data.products[0];
    // USD unchanged
    expect(sample.prices.usd).toBeCloseTo(sample.basePrice, 2);
    // Derived ALGO = usd / 0.5
    expect(sample.prices.algo).toBeCloseTo(sample.basePrice / 0.5, 4);
    // Derived HEMP = usd / 0.0002
    expect(sample.prices.hemp).toBe(Math.round(sample.basePrice / 0.0002));
  });

  it('applies cache (second call uses cache raw then enrichment still matches)', async () => {
    vi.spyOn(oracleMod, 'getOraclePrices').mockResolvedValue({
      algoUsd: 0.4,
      hempUsd: 0.0001,
      usdcUsd: 1,
      source: { backend: true, fallback: false },
      lastUpdated: Date.now()
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, products: [{ id: 99, name: 'Test', strain: '', type: '', flavor: '', effects: '', basePrice: 10, prices: { usd: 10 }, hempEarned: 1, potency: '', terpenes: [], color: '', emoji: '', category: 'vape', inStock: true }] }) }) as any;
    const first = await productService.fetchProducts();
    const second = await productService.fetchProducts();
    expect(first.products[0].prices.algo).toBeCloseTo(10 / 0.4, 4);
    expect(second.products[0].prices.algo).toBeCloseTo(10 / 0.4, 4);
  });
});
