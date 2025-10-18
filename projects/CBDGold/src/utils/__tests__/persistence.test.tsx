import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
// Mark testing mode before App import so component code can optionally read it
// @ts-expect-error: Testing flag for component behavior
globalThis.__TESTING__ = true;
import App from '../../App';
import { AppProviders } from '../../providers';
import { secureStorage } from '../../utils/storage';

type MockFetchResponse = {
  ok: boolean;
  json: () => Promise<{ products: unknown[]; tokenPrices: Record<string, number> }>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  text: () => Promise<string>;
  headers: {
    forEach: (callback: (value: string, key: string) => void) => void;
    get: (key: string) => string | null | undefined;
  };
};

vi.mock('../../onchain/env', () => ({
  chainConfig: {
    mode: 'simulation',
    network: 'testnet'
  }
}));

vi.mock('../../onchain/stakingTransactions', () => ({
  fetchStakingGlobalState: vi.fn(async () => ({ assetId: 0, totalStaked: 0, rewardRate: 0 })),
  fetchStakingLocalState: vi.fn(async () => ({ staked: 0, tier: 'none', pending: 0 }))
}));

// Provide mocks to prevent network & animation libs from causing side effects
vi.stubGlobal('fetch', vi.fn(async () => ({
  ok: true,
  json: async () => ({ products: [], tokenPrices: {} }),
  arrayBuffer: async () => new TextEncoder().encode('{}').buffer,
  text: async () => '{}',
  headers: {
    forEach: () => undefined,
    get: () => null
  }
} satisfies MockFetchResponse)));

HTMLCanvasElement.prototype.getContext = () => null;

const globalWithCanvas = globalThis as Record<string, unknown>;
if (typeof globalWithCanvas.OffscreenCanvas === 'undefined') {
  class MockOffscreenCanvas {
    width = 0;
    height = 0;
    getContext() {
      return null;
    }
  }
  globalWithCanvas.OffscreenCanvas = MockOffscreenCanvas;
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

    type StoredTx = {
      id: string;
      [key: string]: unknown;
    };
    const stored = secureStorage.getJSON<StoredTx[]>('tx_history') ?? [];
    expect(stored.length).toBeLessThanOrEqual(25);
  });
});
