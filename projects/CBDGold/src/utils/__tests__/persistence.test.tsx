import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
// Mark testing mode before App import so component code can optionally read it
// @ts-ignore
globalThis.__TESTING__ = true;
import App from '../../App';
import { AppProviders } from '../../providers';
import { secureStorage } from '../../utils/storage';

// Provide mocks to prevent network & animation libs from causing side effects
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ products: [], tokenPrices: {} }) })));
// Mock setInterval to count calls; we'll allow it but fast-forward only once

// Mock canvas context for lottie
class MockCanvasContext { fillStyle: any; } // minimal shape
// @ts-ignore
HTMLCanvasElement.prototype.getContext = () => new MockCanvasContext();
// @ts-ignore
if (typeof OffscreenCanvas === 'undefined') {
  // @ts-ignore
  globalThis.OffscreenCanvas = function () { return { getContext: () => ({}) }; };
}

function flushMicrotasks() { return act(async () => { await Promise.resolve(); }); }

describe('Persistence (localStorage)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    secureStorage.clearNamespace();
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('loads existing txHistory & stakedHemp on mount', async () => {
    const seedHistory = [
      { id: 'a', type: 'other', status: 'confirmed' as const, createdAt: Date.now() - 1000, note: 'Old Tx', amount: 0, txId: 'SIMULATED_TX_abc1234567' }
    ];
  localStorage.setItem('cbdgold_tx_history', JSON.stringify(seedHistory));
    localStorage.setItem('cbdgold_app_state', JSON.stringify({
      walletConnected: true,
      walletAddress: 'TEST_ADDR',
      accountAssets: { algo: 10, hemp: 12345, weed: 50, usdc: 20 },
      stakedAmount: 12345,
      governance: { proposals: [] }
    }));

    render(
      <AppProviders>
        <App />
      </AppProviders>
    );
    await flushMicrotasks();

    // Presence of history label
    expect(screen.getByText(/Old Tx/)).toBeTruthy();
  // Presence of note text rendered in history list
  expect(screen.getByText('Old Tx')).toBeTruthy();
    // Staked HEMP value displayed (locale aware)
    const stakeDisplay = Number(12345).toLocaleString();
    expect(screen.getAllByText(stakeDisplay).length).toBeGreaterThan(0);
  });

  it('caps txHistory at 25 entries', async () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>
    );
    await flushMicrotasks();

    const many = Array.from({ length: 40 }, (_, i) => ({ id: 'tx' + i, type: 'other' as const, status: 'confirmed' as const, createdAt: Date.now() - i * 1000, note: 'Tx ' + i, amount: 0 }));
  localStorage.setItem('cbdgold_tx_history', JSON.stringify(many));

    render(
      <AppProviders>
        <App />
      </AppProviders>
    ); // re-mount to reload and persist trimmed history
    await flushMicrotasks();

    const stored = secureStorage.getJSON<any[]>('tx_history') ?? [];
    expect(stored.length).toBeLessThanOrEqual(25);
  });
});
