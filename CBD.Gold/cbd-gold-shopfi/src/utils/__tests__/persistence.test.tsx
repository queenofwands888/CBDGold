// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionHistoryPanel from '../../components/sections/TransactionHistoryPanel';
import { TransactionProvider } from '../../contexts/TransactionContext';
import { AppProvider } from '../../contexts/AppContext';
import { SnackbarProvider } from 'notistack';

// Provide mocks to prevent network & animation libs from causing side effects
vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ products: [], tokenPrices: {} }) })));

// Mock canvas context for lottie
class MockCanvasContext { fillStyle: string = ''; } // minimal shape
if (typeof HTMLCanvasElement !== 'undefined') {
  // @ts-expect-error: jsdom canvas context mock
  HTMLCanvasElement.prototype.getContext = () => new MockCanvasContext();
}
if (typeof OffscreenCanvas === 'undefined') {
  // @ts-expect-error: jsdom offscreen canvas mock
  globalThis.OffscreenCanvas = function () { return { getContext: () => ({}) }; };
}
describe('Persistence (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Guard: Remove any invalid localStorage keys
    Object.keys(localStorage).forEach(key => {
      try {
        JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        localStorage.removeItem(key);
      }
    });
  });
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('loads existing txHistory & stakedHemp on mount', async () => {
    const seedHistory = [
      { id: 'a', label: 'Old Tx', type: 'other', kind: 'other', status: 'confirmed' as const, createdAt: Date.now() - 1000, txId: 'SIMULATED_TX_abc1234567' }
    ];
    localStorage.setItem('cbdgold_tx_history', JSON.stringify(seedHistory));
    localStorage.setItem('stakedHemp', '12345');

    render(
      <SnackbarProvider>
        <AppProvider>
          <TransactionProvider>
            <TransactionHistoryPanel />
          </TransactionProvider>
        </AppProvider>
      </SnackbarProvider>
    );
    expect(screen.getByText('Old Tx')).toBeTruthy();
    expect(screen.getByText('SIMULATE…')).toBeTruthy();
  expect(window.localStorage.getItem('stakedHemp')).toBe('12345');
  });

  it('caps txHistory at 25 entries', async () => {
    const capped = Array.from({ length: 25 }, (_, i) => ({ id: 'tx' + i, label: 'Tx ' + i, kind: 'other', status: 'confirmed', createdAt: Date.now() - i * 1000 }));
    localStorage.setItem('cbdgold_tx_history', JSON.stringify(capped));

    render(
      <SnackbarProvider>
        <AppProvider>
          <TransactionProvider>
            <TransactionHistoryPanel />
          </TransactionProvider>
        </AppProvider>
      </SnackbarProvider>
    );
    const stored = JSON.parse(localStorage.getItem('cbdgold_tx_history') || '[]');
    expect(stored.length).toBeLessThanOrEqual(25);
  });
});
