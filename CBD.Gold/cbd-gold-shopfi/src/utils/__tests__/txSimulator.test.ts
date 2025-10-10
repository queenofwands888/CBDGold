import { describe, it, expect } from 'vitest';
import { simulateTransaction } from '../txSimulator';

// Using a very low delay for test speed.

describe('simulateTransaction', () => {
  it('resolves with confirmed status (forced success)', async () => {
    const updates: string[] = [];
    const { promise } = simulateTransaction((s) => updates.push(s), { minDelayMs: 10, maxDelayMs: 20, failRate: 0 });
    const result = await promise;
    expect(result.status).toBe('confirmed');
    expect(updates[0]).toBe('pending');
    expect(result.txId).toMatch(/^SIMULATED_TX_/);
  });

  it('can simulate failure', async () => {
    const { promise } = simulateTransaction(() => { }, { minDelayMs: 5, maxDelayMs: 10, failRate: 1 });
    const result = await promise;
    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });
});
