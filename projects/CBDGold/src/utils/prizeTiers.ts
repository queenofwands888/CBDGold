// Prize tier configuration for spins
export const PRIZES = [
  // Medium: Tokens
  { type: 'token', assetId: 748025551, amount: 100, odds: 0.30, usdcValue: 5, label: '100 HEMP Tokens' },
  { type: 'token', assetId: 748025551, amount: 500, odds: 0.10, usdcValue: 25, label: '500 HEMP Tokens' },

  // Hard: Product NFT/ASA
  { type: 'product', assetId: 4000000001, amount: 1, odds: 0.02, usdcValue: 100, label: 'CBD Vape (NFT)' },

  // Jackpot: Very rare
  { type: 'jackpot', assetId: 4000000002, amount: 1, odds: 0.001, usdcValue: 1000, label: 'Jackpot: Gold Vape NFT' },

  // No win
  { type: 'none', odds: 0.579, label: 'No Win' }
];

export function spinForPrize() {
  const rand = Math.random();
  let cumulative = 0;
  for (const prize of PRIZES) {
    cumulative += prize.odds;
    if (rand < cumulative) {
      return prize;
    }
  }
  return PRIZES[PRIZES.length - 1]; // fallback
}
