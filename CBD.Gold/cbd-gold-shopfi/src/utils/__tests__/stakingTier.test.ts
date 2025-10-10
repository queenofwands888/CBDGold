import { describe, it, expect } from 'vitest';
import { calculateStakingTier } from '../stakingTier';

describe('calculateStakingTier', () => {
  it('returns None for low stake', () => {
    const tier = calculateStakingTier(0);
    expect(tier).toMatchObject({ name: 'None', discount: 0, apy: 0 });
  });
  it('returns Bronze at >=10,000,000', () => {
    const tier = calculateStakingTier(10_000_000);
    expect(tier).toMatchObject({ name: 'Bronze', discount: 20 });
  });
  it('returns Silver at >=100,000,000', () => {
    const tier = calculateStakingTier(100_000_000);
    expect(tier).toMatchObject({ name: 'Silver', discount: 30 });
  });
  it('returns Gold at >=1,000,000,000', () => {
    const tier = calculateStakingTier(1_000_000_000);
    expect(tier).toMatchObject({ name: 'Gold', discount: 50 });
  });
});
