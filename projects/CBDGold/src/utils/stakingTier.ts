// Helper to calculate staking tier benefits based on staked HEMP amount
// Extracted from App.tsx for reuse & testability
export interface StakingTierInfo {
  name: string; discount: number; apy: number; shipping: string; color: string;
}

export const calculateStakingTier = (stakedAmount: number): StakingTierInfo => {
  if (stakedAmount >= 1000000000) return {
    name: 'Gold', discount: 50, apy: 10, shipping: 'Priority', color: 'from-yellow-400 to-yellow-600'
  };
  if (stakedAmount >= 100000000) return {
    name: 'Silver', discount: 30, apy: 5, shipping: 'Faster', color: 'from-gray-300 to-gray-500'
  };
  if (stakedAmount >= 10000000) return {
    name: 'Bronze', discount: 20, apy: 3, shipping: 'Faster', color: 'from-orange-400 to-orange-600'
  };
  return { name: 'None', discount: 0, apy: 0, shipping: 'Standard', color: 'from-gray-600 to-gray-700' };
};
