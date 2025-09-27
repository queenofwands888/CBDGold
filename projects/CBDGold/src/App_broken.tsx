// I am rewriting App.tsx for my React + Tailwind dApp.
// Please completely replace this file with a new component that
// mirrors the layout and styling of https://huggingface.co/spaces/CBDGold/cbdgold
// as closely as possible. Implement the following:
//
// – Header: left-aligned CBD Gold ShopFi logo (circle icon with “CBD”), 
//   centered title, right-aligned “Connect Wallet” button. 
// – Navigation bar under header: Dashboard, CBD Gold, ShopFi, Governance. 
//   Active tab highlighted. Use icons if appropriate.
// – Multi-Token Wallet section: styled card showing truncated Algorand address 
//   when connected, token icons + balances for HEMP, WEED, ALGO, USDC with ASA IDs 
//   and fiat equivalents. Numbers bold. Include a refresh button.
// – Staking Tier Status section: card showing current tier name, discount %, APY %, 
//   staked HEMP, shipping and voting power. Add a progress bar for next tier 
//   and buttons “Stake”, “Unstake”, “Claim Rewards” styled like the Hugging Face Space.
// – Use rounded corners, subtle gradients, drop shadows and consistent padding/margins 
//   for all sections. Make it fully responsive.
// – Add loading states and error notifications when fetching wallet data.
// – Add a footer with FAQ, Docs and Social links.
//
// Use functional React components and Tailwind classes. Do not hardcode balances; 
// leave placeholders or props/state for dynamic data.
import React, { useEffect, useState } from "react";
import "./styles/hf-style.css";

// Feather Icon Component - Default size matches Feather.js default (20px)
const FeatherIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  const icons: { [key: string]: JSX.Element } = {
    home: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
    "shopping-bag": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" x2="21" y1="6" y2="6"/>
        <path d="m16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    lock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <circle cx="12" cy="16" r="1"/>
        <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    users: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="m22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    leaf: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    award: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
      </svg>
    ),
    x: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="6" y1="6" y2="18"/>
        <line x1="6" x2="18" y1="6" y2="18"/>
      </svg>
    ),
    "trending-up": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
        <polyline points="16,7 22,7 22,13"/>
      </svg>
    ),
    "dollar-sign": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="2" y2="22"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    "shopping-cart": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    "refresh-cw": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
    ),
    twitter: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
      </svg>
    ),
    instagram: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
    github: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
        <path d="M9 18c-4.51 2-5-2-7-2"/>
      </svg>
    ),
    discord: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  };
  
  return icons[name] || <div className={className}>{name}</div>;
};

// CBD Vapes Data
const cbdVapes = [
  {
    id: 1,
    name: 'Northern Lights CBD',
    strain: 'Northern Lights',
    type: 'Indica-dominant',
    flavor: 'Sweet Pine & Earth',
    effects: 'Deeply Relaxing',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    color: 'from-purple-500 to-indigo-600',
    emoji: '🌌'
  },
  {
    id: 2,
    name: 'Sour Diesel CBD',
    strain: 'Sour Diesel',
    type: 'Sativa-dominant',
    flavor: 'Citrus Fuel & Herbs',
    effects: 'Energizing Focus',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Limonene', 'Caryophyllene', 'Myrcene'],
    color: 'from-yellow-500 to-orange-600',
    emoji: '⚡'
  },
  {
    id: 3,
    name: 'OG Kush CBD',
    strain: 'OG Kush',
    type: 'Hybrid',
    flavor: 'Earthy Lemon Pine',
    effects: 'Balanced Euphoria',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Myrcene', 'Limonene', 'Caryophyllene'],
    color: 'from-green-500 to-emerald-600',
    emoji: '👑'
  },
  {
    id: 4,
    name: 'Blue Dream CBD',
    strain: 'Blue Dream',
    type: 'Sativa-dominant',
    flavor: 'Blueberry & Vanilla',
    effects: 'Creative & Uplifting',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
    color: 'from-blue-500 to-indigo-600',
    emoji: '💙'
  },
  {
    id: 5,
    name: 'Granddaddy Purple CBD',
    strain: 'Granddaddy Purple',
    type: 'Indica-dominant',
    flavor: 'Grape & Berry',
    effects: 'Full Body Relaxation',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Myrcene', 'Pinene', 'Limonene'],
    color: 'from-purple-700 to-purple-900',
    emoji: '🍇'
  },
  {
    id: 6,
    name: 'Jack Herer CBD',
    strain: 'Jack Herer',
    type: 'Sativa-dominant',
    flavor: 'Pine & Citrus',
    effects: 'Energetic & Focused',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Terpinolene', 'Myrcene', 'Pinene'],
    color: 'from-yellow-300 to-yellow-500',
    emoji: '🌞'
  },
  {
    id: 7,
    name: 'Gelato CBD',
    strain: 'Gelato',
    type: 'Hybrid',
    flavor: 'Sweet Cream & Citrus',
    effects: 'Euphoric & Relaxing',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Limonene', 'Caryophyllene', 'Linalool'],
    color: 'from-pink-400 to-purple-500',
    emoji: '🍦'
  },
  {
    id: 8,
    name: 'Wedding Cake CBD',
    strain: 'Wedding Cake',
    type: 'Indica-dominant',
    flavor: 'Vanilla & Pepper',
    effects: 'Happy & Relaxed',
    priceAlgo: 135,
    priceUsdc: 33.00,
    hempEarned: 135000,
    potency: '66.6% CBD',
    terpenes: ['Limonene', 'Caryophyllene', 'Linalool'],
    color: 'from-white to-pink-200',
    emoji: '🎂'
  }
];

// Staking Pools Data
const stakingPools = [
  {
    id: 1,
    name: 'Bronze Tier',
    minStake: 100000,
    discount: 20,
    apy: 3,
    shipping: 'Faster',
    benefits: ['20% off CBD Gold Vapes', 'Faster shipping', 'Community access'],
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 2,
    name: 'Silver Tier',
    minStake: 500000,
    discount: 30,
    apy: 5,
    shipping: 'Faster',
    benefits: ['30% off CBD Gold Vapes', 'Faster shipping', 'Exclusive strains', 'New releases'],
    color: 'from-gray-300 to-gray-500'
  },
  {
    id: 3,
    name: 'Gold Tier',
    minStake: 1000000,
    discount: 50,
    apy: 10,
    shipping: 'Priority',
    benefits: ['50% off CBD Gold Vapes', 'Priority shipping', 'VIP event tickets', 'All exclusive access'],
    color: 'from-yellow-400 to-yellow-600'
  }
];

const governanceProposals = [
  {
    id: 1,
    title: 'New Strain: Zkittlez CBD',
    description: 'Vote to add Zkittlez-inspired terpene profile with 66.6% CBD potency',
    status: 'Active',
    timeLeft: '5 days',
    weedRequired: 1
  },
  {
    id: 2,
    title: 'Limited Edition: 24K Gold Hardware',
    description: 'Propose gold-plated ceramic tips for premium tier members',
    status: 'Active',
    timeLeft: '12 days',
    weedRequired: 2.5
  },
  {
    id: 3,
    title: 'Expand to New Markets',
    description: 'Proposal to expand CBD Gold distribution to 5 new states',
    status: 'Active',
    timeLeft: '8 days',
    weedRequired: 3
  },
  {
    id: 4,
    title: 'Community Airdrop Event',
    description: 'Quarterly airdrop of 5M HEMP tokens to active stakers',
    status: 'Active',
    timeLeft: '15 days',
    weedRequired: 1.5
  },
  {
    id: 5,
    title: 'New Product: CBD Gummies',
    description: 'Vote to introduce premium CBD gummies with 25mg per serving',
    status: 'Active',
    timeLeft: '3 days',
    weedRequired: 2
  }
];

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "vapes", label: "CBD Gold", icon: "shopping-bag" },
  { key: "staking", label: "ShopFi", icon: "lock" },
  { key: "governance", label: "Governance", icon: "users" },
];

// Helper Functions
function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calculateStakingTier(stakedAmount: number) {
  if (stakedAmount >= 1000000) return { 
    name: 'Gold', 
    discount: 50, 
    apy: 10, 
    shipping: 'Priority', 
    color: 'from-yellow-400 to-yellow-600' 
  };
  if (stakedAmount >= 500000) return { 
    name: 'Silver', 
    discount: 30, 
    apy: 5, 
    shipping: 'Faster', 
    color: 'from-gray-300 to-gray-500' 
  };
  if (stakedAmount >= 100000) return { 
    name: 'Bronze', 
    discount: 20, 
    apy: 3, 
    shipping: 'Faster', 
    color: 'from-orange-400 to-orange-600' 
  };
  return { 
    name: 'None', 
    discount: 0, 
    apy: 0, 
    shipping: 'Standard', 
    color: 'from-gray-600 to-gray-700' 
  };
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletData: {
    address: string;
    hempBalance: number;
    weedBalance: number;
    algoBalance: number;
    usdcBalance: number;
  };
  onDisconnect: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, walletData, onDisconnect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Wallet Connected</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FeatherIcon name="x" className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300 mb-1">Algorand Address:</p>
          <p className="font-mono text-xs text-green-400 break-all">{walletData.address}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-300">HEMP:</p>
            <p className="text-green-400 font-bold">{formatNumber(walletData.hempBalance)}</p>
            <p className="text-xs text-gray-500">ASA: 2675148574</p>
          </div>
          <div>
            <p className="text-gray-300">WEED:</p>
            <p className="text-purple-400 font-bold">{formatNumber(walletData.weedBalance)}</p>
            <p className="text-xs text-gray-500">ASA: 2676316280</p>
          </div>
          <div>
            <p className="text-gray-300">ALGO:</p>
            <p className="text-blue-400 font-bold">{walletData.algoBalance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-300">USDC:</p>
            <p className="text-yellow-400 font-bold">${walletData.usdcBalance.toFixed(2)}</p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);

  // Initialize AOS and Feather icons like the original
  useEffect(() => {
    // Initialize AOS animations
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
      });
    }

    // Initialize Feather Icons
    if (typeof window !== 'undefined' && (window as any).feather) {
      (window as any).feather.replace();
    }
  }, []);

  const [walletData, setWalletData] = useState({
    address: "HEMP7X4A3QZXKJYB2NWVF8H5M9GTCR6PLQS1EUDKA8YW3V2TZRI4BJLM6A",
    hempBalance: 12500000,
    weedBalance: 2500,
    algoBalance: 150.0,
    usdcBalance: 1250.0,
  });

  const [stakingData, setStakingData] = useState({
    stakedTokens: 500000,
  });

  const currentStakingTier = calculateStakingTier(stakingData.stakedTokens);

  const connectWallet = () => {
    setWalletConnected(true);
    setWalletData({
      address: "HEMP7X4A3QZXKJYB2NWVF8H5M9GTCR6PLQS1EUDKA8YW3V2TZRI4BJLM6A",
      hempBalance: 12500000,
      weedBalance: 2500,
      algoBalance: 150,
      usdcBalance: 1250,
    });
    setStakingData({ stakedTokens: 500000 });
    setShowWalletModal(true);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setShowWalletModal(false);
    setWalletData({
      address: '',
      hempBalance: 0,
      weedBalance: 0,
      algoBalance: 0,
      usdcBalance: 0,
    });
    setStakingData({ stakedTokens: 0 });
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  const purchaseWithAlgo = (vapeId: number) => {
    const vape = cbdVapes.find(v => v.id === vapeId);
    if (!vape) return;

    const discountedPrice = vape.priceAlgo * (1 - currentStakingTier.discount / 100);
    
    if (walletData.algoBalance >= discountedPrice) {
      setWalletData(prev => ({
        ...prev,
        algoBalance: prev.algoBalance - discountedPrice,
        hempBalance: prev.hempBalance + vape.hempEarned,
      }));
      
      alert(`Purchased ${vape.name} with ALGO!\n\nCost: ${discountedPrice.toFixed(2)} ALGO (${currentStakingTier.discount}% ${currentStakingTier.name} discount)\nEarned: ${formatNumber(vape.hempEarned)} HEMP\nLP Contribution: ALGO/HEMP pool\nShipping: ${currentStakingTier.shipping}`);
    } else {
      alert(`Insufficient ALGO! Need ${discountedPrice.toFixed(2)} ALGO`);
    }
  };

  const purchaseWithUsdc = (vapeId: number) => {
    const vape = cbdVapes.find(v => v.id === vapeId);
    if (!vape) return;

    const discountedPrice = vape.priceUsdc * (1 - currentStakingTier.discount / 100);
    
    if (walletData.usdcBalance >= discountedPrice) {
      setWalletData(prev => ({
        ...prev,
        usdcBalance: prev.usdcBalance - discountedPrice,
        hempBalance: prev.hempBalance + vape.hempEarned,
      }));
      
      alert(`Purchased ${vape.name} with USDC!\n\nCost: $${discountedPrice.toFixed(2)} USDC (${currentStakingTier.discount}% ${currentStakingTier.name} discount)\nEarned: ${formatNumber(vape.hempEarned)} HEMP\nLP Contribution: USDC/HEMP pool\nWEED tokens purchased for 420vault.algo\nShipping: ${currentStakingTier.shipping}`);
    } else {
      alert(`Insufficient USDC! Need $${discountedPrice.toFixed(2)} USDC`);
    }
  };

  const spinForGold = (vapeId: number) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSpinResult(null);
    
    setTimeout(() => {
      const outcomes = [
        { type: 'hemp', amount: 50000, probability: 0.4 },
        { type: 'hemp', amount: 100000, probability: 0.25 },
        { type: 'hemp', amount: 200000, probability: 0.15 },
        { type: 'discount', amount: 10, probability: 0.1 },
        { type: 'discount', amount: 25, probability: 0.05 },
        { type: 'jackpot', amount: 1000000, probability: 0.05 }
      ];
      
      const random = Math.random();
      let cumulative = 0;
      
      for (let outcome of outcomes) {
        cumulative += outcome.probability;
        if (random <= cumulative) {
          if (outcome.type === 'hemp' || outcome.type === 'jackpot') {
            setWalletData(prev => ({
              ...prev,
              hempBalance: prev.hempBalance + outcome.amount
            }));
          }
          setSpinResult(outcome);
          break;
        }
      }
      
      setIsSpinning(false);
    }, 3000);
  };

  const stakeTokens = (poolId: number) => {
    const pool = stakingPools.find(p => p.id === poolId);
    if (!pool) return;
    
    const input = document.getElementById(`stakingAmount${poolId}`) as HTMLInputElement;
    const amount = parseInt(input?.value || '0');
    
    if (amount && amount <= walletData.hempBalance && amount >= pool.minStake) {
      setWalletData(prev => ({
        ...prev,
        hempBalance: prev.hempBalance - amount
      }));
      setStakingData(prev => ({
        stakedTokens: prev.stakedTokens + amount
      }));
      
      alert(`Successfully staked ${formatNumber(amount)} HEMP tokens!\n\nTier: ${pool.name}\nDiscount: ${pool.discount}% off CBD Gold Vapes\nAPY: ${pool.apy}% HEMP\nShipping: ${pool.shipping}\nBenefits unlocked: ${pool.benefits.join(', ')}`);
    } else {
      alert('Invalid staking amount or insufficient balance!');
    }
  };

  const voteOnProposal = (proposalId: number) => {
    const proposal = governanceProposals.find(p => p.id === proposalId);
    if (!proposal) return;
    
    if (walletData.weedBalance >= proposal.weedRequired) {
      setWalletData(prev => ({
        ...prev,
        weedBalance: prev.weedBalance - proposal.weedRequired
      }));
      alert(`Voted on proposal: ${proposal.title}\n\n${proposal.weedRequired} WEED tokens used for voting`);
    } else {
      alert(`You need at least ${proposal.weedRequired} WEED tokens to vote on this proposal`);
    }
  };

  return (
    <div className="font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img 
              src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/CBD%20Logo%20-%20PNG%20File%20-%20Black%20Background%20-%2072dpi%20-%20Web%20Use.png" 
              alt="CBD Gold Logo" 
              className="h-10 w-10 mr-3 rounded-full"
            />
            <h1 className="text-2xl font-bold">CBD Gold ShopFi</h1>
          </div>
          <button 
            onClick={connectWallet}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              walletConnected 
                ? "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700" 
                : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
            }`}
          >
            {walletConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        </header>

        {/* Wallet Modal */}
        <WalletModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          walletData={walletData}
          onDisconnect={disconnectWallet}
        />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg transform scale-105"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => switchTab(tab.key)}
            >
              <FeatherIcon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div id="contentSections">
          {/* Dashboard Section */}
          <div id="dashboardSection" className={`space-y-8 ${activeTab !== "dashboard" ? "hidden" : ""}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FeatherIcon name="leaf" className="mr-2 text-green-400 w-4 h-4" />
                    Multi-Token Wallet
                  </h3>
                  <button className="text-sm text-red-400 hover:text-red-300 hidden">
                    Disconnect
                  </button>
                </div>
                <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-300">Algorand Address:</p>
                    <p className="font-mono text-xs text-green-400 break-all">
                      {walletConnected ? walletData.address : "Not connected"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-300">HEMP:</p>
                      <p className="text-green-400 font-bold">{formatNumber(walletData.hempBalance)}</p>
                      <p className="text-xs text-gray-500">ASA: 2675148574</p>
                    </div>
                    <div>
                      <p className="text-gray-300">WEED:</p>
                      <p className="text-purple-400 font-bold">{formatNumber(walletData.weedBalance)}</p>
                      <p className="text-xs text-gray-500">ASA: 2676316280</p>
                    </div>
                    <div>
                      <p className="text-gray-300">ALGO:</p>
                      <p className="text-blue-400 font-bold">{walletData.algoBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">USDC:</p>
                      <p className="text-yellow-400 font-bold">${walletData.usdcBalance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FeatherIcon name="award" className="mr-2 text-orange-400 w-4 h-4" />
                    Staking Tier Status
                  </h3>
                </div>
                <div className={`bg-gradient-to-r ${currentStakingTier.color} rounded-lg p-4 mb-3`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black font-bold text-lg">{currentStakingTier.name} Tier</p>
                      <p className="text-black/80 text-sm">{currentStakingTier.discount}% Off • {currentStakingTier.apy}% APY</p>
                    </div>
                    <FeatherIcon name="award" className="text-black w-4 h-4" />
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Staked HEMP:</span>
                    <span className="text-green-400">{formatNumber(stakingData.stakedTokens)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Shipping:</span>
                    <span className="text-blue-400">{currentStakingTier.shipping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Voting Power:</span>
                    <span className="text-purple-400">{formatNumber(Math.floor(walletData.weedBalance / 0.001))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Available HEMP</p>
                    <p className="text-3xl font-bold text-green-400">{(walletData.hempBalance / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-gray-400">Ready to spend</p>
                  </div>
                  <FeatherIcon name="leaf" className="text-green-400 w-4 h-4" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Staked HEMP</p>
                    <p className="text-3xl font-bold text-blue-400">{(stakingData.stakedTokens / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-gray-400">Earning {currentStakingTier.apy}% APY</p>
                  </div>
                  <FeatherIcon name="lock" className="text-blue-400 w-4 h-4" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">WEED Governance</p>
                    <p className="text-3xl font-bold text-purple-400">{formatNumber(walletData.weedBalance)}</p>
                    <p className="text-xs text-gray-400">{formatNumber(Math.floor(walletData.weedBalance / 0.001))} votes</p>
                  </div>
                  <FeatherIcon name="users" className="text-purple-400 w-4 h-4" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">LP Contributions</p>
                    <p className="text-3xl font-bold text-yellow-400">0</p>
                    <p className="text-xs text-gray-400">ALGO/HEMP & HEMP/USDC</p>
                  </div>
                  <FeatherIcon name="trending-up" className="text-yellow-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Vapes Section */}
          <div id="vapesSection" className={`space-y-8 ${activeTab !== "vapes" ? "hidden" : ""}`}>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">CBD Gold 510 Ceramic Vapes</h2>
              <p className="text-gray-300">Premium CBD 510 ceramic vapes with 66.6% CBD potency</p>
              <div className="flex justify-center items-center space-x-4 mt-4">
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentStakingTier.color}`}>
                  <span className={`font-semibold ${currentStakingTier.name === "None" ? "text-white" : "text-black"}`}>
                    {currentStakingTier.name} Tier - {currentStakingTier.discount}% Off All Vapes
                  </span>
                </div>
              </div>
            </div>

            {spinResult && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-4">🎰 Spin Result - Verified on Algorand!</h3>
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <p className={`font-bold ${
                    spinResult.type === 'hemp' ? 'text-green-400' :
                    spinResult.type === 'discount' ? 'text-yellow-400' :
                    'text-purple-400'
                  }`}>
                    {spinResult.type === 'hemp' && `Won ${formatNumber(spinResult.amount)} HEMP tokens!`}
                    {spinResult.type === 'discount' && `Won ${spinResult.amount}% additional discount!`}
                    {spinResult.type === 'jackpot' && `🎉 JACKPOT! Won ${formatNumber(spinResult.amount)} HEMP tokens!`}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cbdVapes.map((vape) => {
                const discountedAlgoPrice = vape.priceAlgo * (1 - currentStakingTier.discount / 100);
                const discountedUsdcPrice = vape.priceUsdc * (1 - currentStakingTier.discount / 100);
                
                return (
                  <div key={vape.id} className="glass-card rounded-2xl p-6 overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${vape.color} opacity-20 rounded-full -mr-10 -mt-10`}></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <img 
                          src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/vape%20cart%20white%20top.jpeg" 
                          alt={vape.name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          vape.type.includes('Indica') ? 'bg-purple-600 text-white' :
                          vape.type.includes('Sativa') ? 'bg-yellow-600 text-black' :
                          'bg-green-600 text-white'
                        }`}>
                          {vape.type}
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-lg mb-1">{vape.name}</h3>
                      <p className="text-sm text-gray-300 mb-2">3rd Party Lab Tested</p>
                      
                      <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Flavor:</span>
                          <span className="text-yellow-400">{vape.flavor}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Effects:</span>
                          <span className="text-green-400">{vape.effects}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Potency:</span>
                          <span className="text-blue-400 font-bold">{vape.potency}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-1">Key Terpenes:</p>
                        <div className="flex flex-wrap gap-1">
                          {vape.terpenes.map(terpene => (
                            <span key={terpene} className="px-2 py-1 bg-green-600/30 text-green-300 text-xs rounded-full">
                              {terpene}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4">
                        <div className="text-center mb-2">
                          <p className="text-lg font-bold text-blue-400">{discountedAlgoPrice.toFixed(2)} ALGO</p>
                          <p className="text-lg font-bold text-yellow-400">${discountedUsdcPrice.toFixed(2)} USDC</p>
                          {currentStakingTier.discount > 0 && (
                            <p className="text-xs text-green-400">({currentStakingTier.discount}% {currentStakingTier.name} discount applied)</p>
                          )}
                        </div>
                        <div className="text-xs text-center">
                          <p className="text-green-300">Earn: {formatNumber(vape.hempEarned)} HEMP</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button 
                          onClick={() => purchaseWithAlgo(vape.id)}
                          disabled={walletData.algoBalance < discountedAlgoPrice}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm ${
                            walletData.algoBalance >= discountedAlgoPrice
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <FeatherIcon name="dollar-sign" className="inline mr-2 w-4 h-4" />
                          Buy with ALGO
                        </button>
                        
                        <button 
                          onClick={() => purchaseWithUsdc(vape.id)}
                          disabled={walletData.usdcBalance < discountedUsdcPrice}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm ${
                            walletData.usdcBalance >= discountedUsdcPrice
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <FeatherIcon name="shopping-cart" className="inline mr-2 w-4 h-4" />
                          Buy with USDC
                        </button>
                        
                        <button 
                          onClick={() => spinForGold(vape.id)}
                          disabled={isSpinning}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm ${
                            isSpinning
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                          }`}
                        >
                          <FeatherIcon name="refresh-cw" className={`inline mr-2 w-4 h-4 ${isSpinning ? 'spinning' : ''}`} />
                          {isSpinning ? 'SPINNING...' : 'SPIN FOR GOLD'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staking Section */}
          <div id="stakingSection" className={`space-y-8 ${activeTab !== "staking" ? "hidden" : ""}`}>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">HEMP Token ShopFi</h2>
              <p className="text-gray-300">Stake HEMP tokens to unlock tiered discounts and exclusive benefits</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stakingPools.map((pool) => (
                <div key={pool.id} className="glass-card rounded-2xl p-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${pool.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                      <FeatherIcon name="lock" className="text-white w-6 h-6" />
                    </div>
                    
                    <h3 className="font-bold text-white text-xl mb-2">{pool.name}</h3>
                    
                    <div className={`inline-block px-4 py-2 rounded-full mb-4 bg-gradient-to-r ${pool.color}`}>
                      <span className="text-black font-bold">{pool.discount}% OFF</span>
                    </div>
                    
                    <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Min Stake:</span>
                          <span className="text-green-400">{(pool.minStake / 1000000).toFixed(1)}M HEMP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">APY:</span>
                          <span className="text-blue-400">{pool.apy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Shipping:</span>
                          <span className="text-purple-400">{pool.shipping}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-300 font-semibold mb-2">Benefits:</p>
                      <div className="space-y-1">
                        {pool.benefits.map(benefit => (
                          <p key={benefit} className="text-xs text-yellow-400">• {benefit}</p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="number"
                        placeholder={`Min ${(pool.minStake / 1000000).toFixed(1)}M HEMP`}
                        id={`stakingAmount${pool.id}`}
                        className="w-full bg-black bg-opacity-30 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm"
                      />
                      
                      <button
                        onClick={() => stakeTokens(pool.id)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r ${pool.color} text-black hover:opacity-90 text-sm`}
                      >
                        Stake HEMP Tokens
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Section */}
          <div id="governanceSection" className={`space-y-8 ${activeTab !== "governance" ? "hidden" : ""}`}>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">WEED Governance</h2>
              <p className="text-gray-300">Participate in platform governance with your WEED tokens</p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FeatherIcon name="users" className="mr-2 text-purple-400 w-4 h-4" />
                  Active Proposals
                </h3>
                <span className="text-sm text-purple-400">
                  Voting Power: {formatNumber(Math.floor(walletData.weedBalance / 0.001))}
                </span>
              </div>

              <div className="space-y-4">
                {governanceProposals.map((proposal) => (
                  <div key={proposal.id} className="glass-card rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{proposal.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        proposal.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{proposal.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{proposal.timeLeft} left</span>
                      <div>
                        <span className="text-purple-400 mr-2">{proposal.weedRequired} WEED to vote</span>
                        <button 
                          onClick={() => voteOnProposal(proposal.id)}
                          disabled={walletData.weedBalance < proposal.weedRequired}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            walletData.weedBalance >= proposal.weedRequired
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Vote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">ShopFi</h3>
              <p className="text-gray-400 text-sm">Hemp Innovation powered by CBD Gold & Algorand</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition">CBD Gold Vapes</a></li>
                <li><a href="#" className="hover:text-green-400 transition">ShopFi Staking</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Governance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition">Whitepaper</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Tokenomics</a></li>
                <li><a href="#" className="hover:text-green-400 transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition">
                  <FeatherIcon name="twitter" className="w-4 h-4" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">
                  <FeatherIcon name="instagram" className="w-4 h-4" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">
                  <FeatherIcon name="discord" className="w-4 h-4" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">
                  <FeatherIcon name="github" className="w-4 h-4" />
                </a>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <p>support@cbdgold.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>© 2025 CBD Gold ShopFi. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-green-400 transition">Terms</a>
                <a href="#" className="hover:text-green-400 transition">Privacy</a>
                <a href="#" className="hover:text-green-400 transition">Compliance</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}