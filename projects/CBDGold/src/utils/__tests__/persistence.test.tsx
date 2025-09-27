import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
// Mark testing mode before App import so component code can optionally read it
// @ts-ignore
globalThis.__TESTING__ = true;
import App from '../../App';

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
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('loads existing txHistory & stakedHemp on mount', async () => {
    const seedHistory = [
      { id: 'a', label: 'Old Tx', kind: 'other', status: 'confirmed' as const, createdAt: Date.now() - 1000, txId: 'SIMULATED_TX_abc1234567' }
    ];
    localStorage.setItem('txHistory', JSON.stringify(seedHistory));
    localStorage.setItem('stakedHemp', '12345');

    render(<App />);
    await flushMicrotasks();

    // Presence of history label
    expect(screen.getByText(/Old Tx/)).toBeTruthy();
    // Presence of truncated txId link
    const link = screen.getAllByRole('link').find(l => l.getAttribute('href')?.includes('SIMULATED_TX_abc1234567')) as HTMLAnchorElement | undefined;
    expect(link).toBeTruthy();
    // Staked HEMP value displayed (locale aware)
    const stakeDisplay = Number(12345).toLocaleString();
    expect(screen.getAllByText(stakeDisplay).length).toBeGreaterThan(0);
  });

  it('caps txHistory at 25 entries', async () => {
    render(<App />);
    await flushMicrotasks();

    const many = Array.from({ length: 40 }, (_, i) => ({ id: 'tx' + i, label: 'Tx ' + i, kind: 'other' as const, status: 'confirmed' as const, createdAt: Date.now() - i * 1000 }));
    localStorage.setItem('txHistory', JSON.stringify(many));

    render(<App />); // re-mount to reload
    await flushMicrotasks();

    const stored = JSON.parse(localStorage.getItem('txHistory') || '[]');
    expect(stored.length).toBeLessThanOrEqual(25);
  });
});
