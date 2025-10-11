import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isRateLimited } from '../../utils/security';
import { secureStorage } from '../../utils/storage';

const advanceTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
};

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    secureStorage.clearNamespace();
    localStorage.clear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    secureStorage.clearNamespace();
    localStorage.clear();
  });

  it('enforces per-key thresholds within the window', () => {
    const limit = 3;
    for (let i = 0; i < limit; i++) {
      expect(isRateLimited('unit-test', limit, 60000)).toBe(false);
    }
    expect(isRateLimited('unit-test', limit, 60000)).toBe(true);

    advanceTime(60000);
    expect(isRateLimited('unit-test', limit, 60000)).toBe(false);
  });

  it('migrates legacy localStorage keys into secureStorage buckets', () => {
    const now = Date.now();
    localStorage.setItem('rate_limit_legacy', JSON.stringify([now - 1000, now - 2000]));

    expect(isRateLimited('legacy', 2, 5000)).toBe(true);

    const buckets = secureStorage.getJSON<Record<string, number[]>>('rate_limits');
    expect(buckets?.legacy?.length).toBeGreaterThan(0);
    expect(localStorage.getItem('rate_limit_legacy')).toBeNull();
  });
});
