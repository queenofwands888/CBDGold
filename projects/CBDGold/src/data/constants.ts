// Centralized static data & config extracted from App.tsx for simplification

export interface VapeProduct {
  id: number; name: string; strain: string; type: string; flavor: string; effects: string;
  priceAlgo: number; priceUsdc: number; hempEarned: number; potency: string; terpenes: string[];
  color: string; emoji: string;
}

export const CBD_VAPES: VapeProduct[] = [
  { id: 1, name: 'Northern Lights CBD', strain: 'Northern Lights', type: 'Indica-dominant', flavor: 'Sweet Pine & Earth', effects: 'Deeply Relaxing', priceAlgo: 135, priceUsdc: 33.00, hempEarned: 135000, potency: '66.6% CBD', terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'], color: 'from-purple-500 to-indigo-600', emoji: '🌌' },
  { id: 2, name: 'Sour Diesel CBD', strain: 'Sour Diesel', type: 'Sativa-dominant', flavor: 'Citrus Fuel & Herbs', effects: 'Energizing Focus', priceAlgo: 135, priceUsdc: 33.00, hempEarned: 135000, potency: '66.6% CBD', terpenes: ['Limonene', 'Caryophyllene', 'Myrcene'], color: 'from-yellow-500 to-orange-600', emoji: '⚡' },
  { id: 3, name: 'OG Kush CBD', strain: 'OG Kush', type: 'Hybrid', flavor: 'Earthy Lemon Pine', effects: 'Balanced Euphoria', priceAlgo: 135, priceUsdc: 33.00, hempEarned: 135000, potency: '66.6% CBD', terpenes: ['Myrcene', 'Limonene', 'Caryophyllene'], color: 'from-green-500 to-emerald-600', emoji: '👑' },
  { id: 4, name: 'Blue Dream CBD', strain: 'Blue Dream', type: 'Sativa-dominant', flavor: 'Blueberry & Vanilla', effects: 'Creative & Uplifting', priceAlgo: 135, priceUsdc: 33.00, hempEarned: 135000, potency: '66.6% CBD', terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'], color: 'from-blue-500 to-indigo-600', emoji: '💙' },
  { id: 5, name: 'Girl Scout Cookies CBD', strain: 'Girl Scout Cookies', type: 'Hybrid', flavor: 'Sweet Mint & Chocolate', effects: 'Relaxed Focus', priceAlgo: 140, priceUsdc: 34.50, hempEarned: 140000, potency: '68.2% CBD', terpenes: ['Caryophyllene', 'Limonene', 'Humulene'], color: 'from-pink-500 to-rose-600', emoji: '🍪' },
  { id: 6, name: 'White Widow CBD', strain: 'White Widow', type: 'Hybrid', flavor: 'Woody & Spicy', effects: 'Euphoric Balance', priceAlgo: 138, priceUsdc: 33.75, hempEarned: 138000, potency: '67.3% CBD', terpenes: ['Myrcene', 'Caryophyllene', 'Pinene'], color: 'from-gray-400 to-slate-600', emoji: '🕷️' },
  { id: 7, name: 'Pineapple Express CBD', strain: 'Pineapple Express', type: 'Sativa-dominant', flavor: 'Tropical Pineapple', effects: 'Happy & Energetic', priceAlgo: 142, priceUsdc: 35.00, hempEarned: 142000, potency: '69.1% CBD', terpenes: ['Limonene', 'Myrcene', 'Pinene'], color: 'from-yellow-400 to-amber-600', emoji: '🍍' },
  { id: 8, name: 'Purple Haze CBD', strain: 'Purple Haze', type: 'Sativa-dominant', flavor: 'Berry & Floral', effects: 'Dreamy & Uplifting', priceAlgo: 145, priceUsdc: 36.00, hempEarned: 145000, potency: '70.5% CBD', terpenes: ['Terpinolene', 'Myrcene', 'Caryophyllene'], color: 'from-purple-600 to-violet-700', emoji: '💜' }
];

export interface StakingPool { id: number; name: string; minStake: number; discount: number; apy: number; shipping: string; benefits: string[]; color: string; }
export const STAKING_POOLS: StakingPool[] = [
  { id: 1, name: 'Bronze Tier', minStake: 10000000, discount: 20, apy: 3, shipping: 'Faster', benefits: ['20% off CBD Gold Vapes', 'Faster shipping', 'Community access'], color: 'from-orange-400 to-orange-600' },
  { id: 2, name: 'Silver Tier', minStake: 100000000, discount: 30, apy: 5, shipping: 'Faster', benefits: ['30% off CBD Gold Vapes', 'Faster shipping', 'Exclusive strains', 'New releases'], color: 'from-gray-300 to-gray-500' },
  { id: 3, name: 'Gold Tier', minStake: 1000000000, discount: 50, apy: 10, shipping: 'Priority', benefits: ['50% off CBD Gold Vapes', 'Priority shipping', 'VIP event tickets', 'All exclusive access'], color: 'from-yellow-400 to-yellow-600' }
];

export interface GovernanceProposal { id: number; title: string; description: string; status: string; timeLeft: string; weedRequired: number; }
export const GOVERNANCE_PROPOSALS: GovernanceProposal[] = [
  { id: 1, title: 'New Strain: Zkittlez CBD', description: 'Vote to add Zkittlez-inspired terpene profile with 66.6% CBD potency', status: 'Active', timeLeft: '5 days', weedRequired: 1 },
  { id: 2, title: 'Limited Edition: 24K Gold Hardware', description: 'Propose gold-plated ceramic tips for premium tier members', status: 'Active', timeLeft: '12 days', weedRequired: 2.5 },
  { id: 3, title: 'Expand to New Markets', description: 'Proposal to expand CBD Gold distribution to 5 new states', status: 'Active', timeLeft: '8 days', weedRequired: 3 },
  { id: 4, title: 'Community Airdrop Event', description: 'Quarterly airdrop of 5M HEMP tokens to active stakers', status: 'Active', timeLeft: '15 days', weedRequired: 1.5 },
  { id: 5, title: 'New Product: CBD Gummies', description: 'Vote to introduce premium CBD gummies with 25mg per serving', status: 'Active', timeLeft: '3 days', weedRequired: 2 }
];

export const ALGORAND_TESTNET_CONFIG = { server: 'https://testnet-api.algonode.cloud', port: '', token: '', network: 'TestNet' };
// Add this after the ALGORAND_TESTNET_CONFIG line (around line 36):

// Deployed Smart Contract App IDs on TestNet (September 27, 2025)
export const CONTRACT_APP_IDS = {
  STAKING: 746492270,
  GOVERNANCE: 746492276,
  PRIZE: 746492277
} as const;

// Contract Explorer Links for TestNet
export const CONTRACT_EXPLORER_LINKS = {
  STAKING: 'https://testnet.algoexplorer.io/application/746492270',
  GOVERNANCE: 'https://testnet.algoexplorer.io/application/746492276',
  PRIZE: 'https://testnet.algoexplorer.io/application/746492277'
} as const;

// Asset IDs for TestNet
export const ASSET_IDS = {
  HEMP: 2675148574,
  WEED: 2676316280,
  USDC: 31566704
} as const;

// Deployment Information
export const DEPLOYMENT_INFO = {
  network: 'testnet',
  timestamp: '2025-09-27T19:30:31.152454',
  deployer: 'CGTC2DCA5GDDRFBT5A7QC6WUQKTAOT2325XOVG6FUSAHAUQJK66GTEYZ2A',
  transactions: {
    staking: 'G442PKEBST62YK6B5DOEYYQBM3S2SY6Q72ILFZTRIZKMOKB4N47A',
    governance: 'GV2FZCGMABZ6S44QDBOQJF4BXEAUABKJYAUTIHLKY5MDCYZSTURA',
    prize: 'F27PUHGEKWW5WXF6BCQJ7OBG625NI6E665K5GQ4WBA3BQ25MRWSA'
  }
} as const;

// Economic & UX Config
export const ECON_CONFIG = {
  SPIN_BONUS_DURATION_MS: 10 * 60 * 1000, // 10 minutes
  MAX_TOTAL_DISCOUNT: 60, // cap composite discount
  HEMP_REWARD_PER_ALGO: 1000, // heuristic placeholder
  HEMP_REWARD_PER_USDC: 4000,
  HEMP_REWARD_PER_SPIN_CREDIT_TX: true // flag to differentiate spin events if needed
} as const;

// Prize tiers for spin / prize contract alignment (front-end reference only; on-chain validation must occur in contract logic)
export interface PrizeTier {
  id: string;
  label: string;
  rarity: 'JACKPOT' | 'RARE' | 'LEGENDARY' | 'GOLDEN';
  type: 'NFT_FULL_RANGE' | 'NFT_SINGLE_VAPE' | 'NFT_COUPON' | 'DISCOUNT_COUPON';
  discountPct?: number; // for coupon tiers
  metadataHint: string; // pointer to expected NFT metadata or coupon semantics
  description: string;
  displayColor: string; // gradient or token
}

export const PRIZE_TIERS: PrizeTier[] = [
  {
    id: 'jackpot_full_range_nft',
    label: 'Full Product Range NFT',
    rarity: 'JACKPOT',
    type: 'NFT_FULL_RANGE',
    metadataHint: 'nft:full-range-collection-access',
    description: 'Redeemable NFT granting entitlement to entire current vape product line (1 of each).',
    displayColor: 'from-fuchsia-500 to-yellow-400'
  },
  {
    id: 'rare_single_vape_nft',
    label: '1x CBD Gold Vape NFT',
    rarity: 'RARE',
    type: 'NFT_SINGLE_VAPE',
    metadataHint: 'nft:single-vape-claim',
    description: 'NFT voucher redeemable for any single CBD Gold vape in the catalog.',
    displayColor: 'from-indigo-400 to-sky-500'
  },
  {
    id: 'legendary_coupon_25',
    label: '25% Off NFT Coupon',
    rarity: 'LEGENDARY',
    type: 'NFT_COUPON',
    discountPct: 25,
    metadataHint: 'coupon:25-off',
    description: 'Transferable NFT coupon granting 25% off one qualifying purchase.',
    displayColor: 'from-amber-400 to-orange-600'
  },
  {
    id: 'golden_coupon_7',
    label: '7% Off Coupon',
    rarity: 'GOLDEN',
    type: 'DISCOUNT_COUPON',
    discountPct: 7,
    metadataHint: 'coupon:7-off',
    description: 'Common outcome; 7% discount coupon (non-NFT soft credit if not minted).',
    displayColor: 'from-yellow-300 to-yellow-500'
  }
];