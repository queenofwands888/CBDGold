import React, { useState, useEffect, Suspense } from 'react';
import './styles/hf-style.css';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import { useSnackbar } from 'notistack';
import {
  validateWalletAddress,
  sanitizeInput,
  validateNumericInput,
  secureLogger,
  isRateLimited,
  SecurityConfig
} from './utils/security';
import ClaimPrize from './components/ClaimPrize';
import AssetOptIn from './components/AssetOptIn';
import PrivacyNotice from './components/PrivacyNotice';
import TransactionOverlay from './components/TransactionOverlay';
import AdminDashboard from './admin/AdminDashboard';
import { hasPrizeToClaim as checkPrizeOwnership } from './utils/checkPrizeOwnership';
import { PRIZES, spinForPrize } from './utils/prizeTiers';
import { calculateStakingTier } from './utils/stakingTier';
// Sections now modular & (optionally) lazy-loaded
const VapesSection = React.lazy(() => import('./components/sections/VapesSection'));
const StakingSection = React.lazy(() => import('./components/sections/StakingSection'));
const GovernanceSection = React.lazy(() => import('./components/sections/GovernanceSection'));
import FeatherIcon from './components/FeatherIcon';
import WalletModal from './components/WalletModal';
// @ts-ignore: JS service with .d.ts provided
import productService from './services/productService';
import { clearOracleCache } from './services/oraclePriceService';
import PriceBar from './components/PriceBar';
// simulateTransaction migrated behind useSimulatedTx hook
import { useSimulatedTx } from './hooks/useSimulatedTx';
import TransactionHistoryPanel, { TxHistoryItem } from './components/TransactionHistoryPanel';

// NOTE: React state hooks must be inside a component; these were moved into App().

// Type declarations for external libraries
declare global {
  interface Window {
    feather: {
      replace: () => void;
    };
    AOS: {
      init: (options: any) => void;
    };
  }
}


// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet chain ID
});


// Types
interface VapeProduct {
  id: number;
  name: string;
  strain: string;
  type: string;
  flavor: string;
  effects: string;
  priceAlgo: number;
  priceUsdc: number;
  hempEarned: number;
  potency: string;
  terpenes: string[];
  color: string;
  emoji: string;
}

interface StakingPool {
  id: number;
  name: string;
  minStake: number;
  discount: number;
  apy: number;
  shipping: string;
  benefits: string[];
  color: string;
}

interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  status: string;
  timeLeft: string;
  weedRequired: number;
}

// Static content moved to data/constants for maintainability
import { CBD_VAPES as cbdVapes, STAKING_POOLS as stakingPools, GOVERNANCE_PROPOSALS as governanceProposals, ALGORAND_TESTNET_CONFIG } from './data/constants';








export default function App() {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountAssets, setAccountAssets] = useState({
    algo: 0,
    hemp: 0,
    weed: 0,
    usdc: 0
  });
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [hasPrizeToClaim, setHasPrizeToClaim] = useState(false);
  const [lastPrize, setLastPrize] = useState<any>(null);
  const [prizeWinners, setPrizeWinners] = useState<{ id: string; address: string; prize: string; label: string; time: number; tier: string }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [tokenPrices, setTokenPrices] = useState<any>({});
  const [oracleMeta, setOracleMeta] = useState<any>(null);
  const [lastLiveOracle, setLastLiveOracle] = useState<any>(null);
  const [priceDelta, setPriceDelta] = useState<{ algoPct?: number; hempPct?: number; weedPct?: number } | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ algo: { t: number; v: number }[]; hemp: { t: number; v: number }[] }>({ algo: [], hemp: [] });
  const [priceFeedPaused, setPriceFeedPaused] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');

  // Simple backend health check
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/health`);
        if (res.ok) {
          setBackendStatus('up');
        } else {
          setBackendStatus('down');
        }
      } catch {
        setBackendStatus('down');
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);
  // Asset opt-in state placeholders (assume opted in for now; replace with detection logic)
  const [hempOptedIn, setHempOptedIn] = useState(true);
  const [weedOptedIn, setWeedOptedIn] = useState(true);
  const [usdcOptedIn, setUsdcOptedIn] = useState(true);

  // Transaction status state + overlay
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
  const [txId, setTxId] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState<string | undefined>(undefined);
  const [showTxOverlay, setShowTxOverlay] = useState(false);
  const [txHistory, setTxHistory] = useState<TxHistoryItem[]>([]);
  const [stakedHemp, setStakedHemp] = useState<number>(0);
  const [stakingTier, setStakingTier] = useState(() => calculateStakingTier(0));
  const [simulatedEarned, setSimulatedEarned] = useState<number>(0); // cumulative simulated rewards
  const [stakedByPool, setStakedByPool] = useState<Record<number, number>>({});
  const { run: runSimTx } = useSimulatedTx();
  const pushTxHistory = (partial: Omit<TxHistoryItem, 'createdAt'>) => {
    setTxHistory(h => [{ ...partial, createdAt: Date.now() }, ...h].slice(0, 25));
  };
  const updateTxHistoryStatus = (id: string, status: TxHistoryItem['status'], extra?: Partial<TxHistoryItem>) => {
    setTxHistory(h => h.map(t => t.id === id ? { ...t, status, ...extra } : t));
  };

  // Load tx history & staked hemp from localStorage on mount
  useEffect(() => {
    try {
      const hist = localStorage.getItem('txHistory');
      if (hist) {
        const parsed = JSON.parse(hist);
        if (Array.isArray(parsed)) setTxHistory(parsed.slice(0, 25));
      }
      const staked = localStorage.getItem('stakedHemp');
      if (staked) {
        const num = Number(staked);
        if (!Number.isNaN(num)) {
          setStakedHemp(num);
          setStakingTier(calculateStakingTier(num));
        }
      }
      const earned = localStorage.getItem('simulatedEarned');
      if (earned) {
        const numE = Number(earned); if (!Number.isNaN(numE)) setSimulatedEarned(numE);
      }
      const sbp = localStorage.getItem('stakedByPool');
      if (sbp) {
        const parsed = JSON.parse(sbp); if (parsed && typeof parsed === 'object') setStakedByPool(parsed);
      }
      const winners = localStorage.getItem('prizeWinners');
      if (winners) {
        const parsed = JSON.parse(winners);
        if (Array.isArray(parsed)) setPrizeWinners(parsed.slice(0, 25));
      }
      const oracleSnap = localStorage.getItem('oracleMeta');
      if (oracleSnap) {
        const parsed = JSON.parse(oracleSnap);
        if (parsed && parsed.lastUpdated) setOracleMeta(parsed);
      }
      const lastLiveSnap = localStorage.getItem('lastLiveOracle');
      if (lastLiveSnap) {
        try { const parsed = JSON.parse(lastLiveSnap); if (parsed?.lastUpdated) setLastLiveOracle(parsed); } catch { }
      }
      const deltaSnap = localStorage.getItem('priceDelta');
      if (deltaSnap) {
        try { const parsed = JSON.parse(deltaSnap); if (parsed && typeof parsed === 'object') setPriceDelta(parsed); } catch { }
      }
      const histSnap = localStorage.getItem('priceHistory');
      if (histSnap) {
        try { const parsed = JSON.parse(histSnap); if (parsed?.algo && parsed?.hemp) setPriceHistory(parsed); } catch { }
      }
      const pausedSnap = localStorage.getItem('priceFeedPaused');
      if (pausedSnap) {
        try { const parsed = JSON.parse(pausedSnap); if (typeof parsed === 'boolean') setPriceFeedPaused(parsed); } catch { }
      }
    } catch { }
  }, []);
  // Persist
  useEffect(() => { try { localStorage.setItem('txHistory', JSON.stringify(txHistory)); } catch { } }, [txHistory]);
  useEffect(() => { try { localStorage.setItem('stakedHemp', String(stakedHemp)); } catch { }; setStakingTier(calculateStakingTier(stakedHemp)); }, [stakedHemp]);
  useEffect(() => { try { localStorage.setItem('simulatedEarned', String(simulatedEarned)); } catch { }; }, [simulatedEarned]);
  useEffect(() => { try { localStorage.setItem('stakedByPool', JSON.stringify(stakedByPool)); } catch { }; }, [stakedByPool]);
  useEffect(() => { try { localStorage.setItem('prizeWinners', JSON.stringify(prizeWinners)); } catch { }; }, [prizeWinners]);
  useEffect(() => { if (oracleMeta) { try { localStorage.setItem('oracleMeta', JSON.stringify(oracleMeta)); } catch { } } }, [oracleMeta]);
  useEffect(() => { if (lastLiveOracle) { try { localStorage.setItem('lastLiveOracle', JSON.stringify(lastLiveOracle)); } catch { } } }, [lastLiveOracle]);
  useEffect(() => { if (priceDelta) { try { localStorage.setItem('priceDelta', JSON.stringify({ ...priceDelta, ts: Date.now() })); } catch { } } }, [priceDelta]);
  useEffect(() => { try { localStorage.setItem('priceHistory', JSON.stringify(priceHistory)); } catch { } }, [priceHistory]);
  useEffect(() => { try { localStorage.setItem('priceFeedPaused', JSON.stringify(priceFeedPaused)); } catch { } }, [priceFeedPaused]);

  // Placeholder: Replace with actual logic to check if user owns a prize NFT/ASA
  // const hasPrizeToClaim = walletConnected && walletAddress && true; // TODO: implement real check

  useEffect(() => {
    // Initialize AOS animations
    if (window.AOS) {
      window.AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
      });
    }

    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }

    // Check if wallet was previously connected
    checkWalletConnection();

    // Listen for wallet disconnect events
    peraWallet.connector?.on('disconnect', handleWalletDisconnect);

    // Load products from backend
    productService.clearCache();
    loadProducts();

    return () => {
      // Clean up will be handled by component unmount
    };
  }, []);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const prevLive = oracleMeta && oracleMeta.source?.backend && !oracleMeta.source?.fallback ? oracleMeta : lastLiveOracle;
      const productData = await (productService as any).fetchProducts();
      setProducts(productData.products || []);
      setTokenPrices(productData.tokenPrices || {});
      if (productData.oracle) {
        setOracleMeta(productData.oracle);
        if (productData.oracle.source?.backend && !productData.oracle.source?.fallback) {
          if (prevLive && prevLive !== productData.oracle) {
            const algoPct = prevLive.algoUsd ? ((productData.oracle.algoUsd - prevLive.algoUsd) / prevLive.algoUsd) * 100 : undefined;
            const hempPct = prevLive.hempUsd ? ((productData.oracle.hempUsd - prevLive.hempUsd) / prevLive.hempUsd) * 100 : undefined;
            const weedPct = prevLive.weedUsd ? ((productData.oracle.weedUsd - prevLive.weedUsd) / prevLive.weedUsd) * 100 : undefined;
            setPriceDelta({ algoPct, hempPct, weedPct });
            const COOLDOWN_MS = 30_000;
            const now = Date.now();
            let alertStore: Record<string, number> = {};
            try { const raw = localStorage.getItem('priceAlertTimestamps'); if (raw) alertStore = JSON.parse(raw) || {}; } catch { alertStore = {}; }
            const maybeAlert = (token: string, pct?: number) => {
              if (pct === undefined || isNaN(pct) || Math.abs(pct) < 2) return;
              const last = alertStore[token] || 0;
              if (now - last < COOLDOWN_MS) return;
              enqueueSnackbar(`${token} ${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`, { variant: 'info' });
              alertStore[token] = now;
            };
            maybeAlert('ALGO', algoPct);
            maybeAlert('HEMP', hempPct);
            maybeAlert('WEED', weedPct);
            try { localStorage.setItem('priceAlertTimestamps', JSON.stringify(alertStore)); } catch { }
          } else {
            setPriceDelta(null);
          }
          setLastLiveOracle(productData.oracle);
          // history (live only)
          setPriceHistory(h => {
            const maxPoints = 90; // ~15 minutes at 10s
            const now = Date.now();
            const algoArr = [...h.algo, { t: now, v: productData.oracle.algoUsd }].slice(-maxPoints);
            const hempArr = [...h.hemp, { t: now, v: productData.oracle.hempUsd }].slice(-maxPoints);
            return { algo: algoArr, hemp: hempArr };
          });
        }
      }
    } catch (error) {
      secureLogger.error('Failed to load products', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const refreshOraclePrices = async () => {
    try {
      productService.clearCache();
      clearOracleCache();
      await loadProducts();
    } catch (e) {
      secureLogger.error('Manual refresh failed', e);
    }
  };

  useEffect(() => {
    async function checkPrize() {
      if (walletConnected && walletAddress) {
        const algodClient = new algosdk.Algodv2('', ALGORAND_TESTNET_CONFIG.server, '');
        const result = await checkPrizeOwnership(walletAddress, algodClient);
        setHasPrizeToClaim(result);
      } else {
        setHasPrizeToClaim(false);
      }
    }
    checkPrize();
  }, [walletConnected, walletAddress]);

  // Auto-refresh products and prices every 10 seconds (only on dashboard & not paused)
  useEffect(() => {
    if ((globalThis as any).__TESTING__) return;
    if (activeTab !== 'dashboard') return; // disable polling on other tabs
    if (priceFeedPaused) return;
    const interval = setInterval(() => {
      if (!loadingProducts) loadProducts();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadingProducts, priceFeedPaused, activeTab]);

  const checkWalletConnection = async () => {
    try {
      const accounts = await peraWallet.reconnectSession();
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        await fetchAccountAssets(accounts[0]);
      }
    } catch (error) {
      secureLogger.log('No previous wallet connection found');
    }
  };

  const validateTestNet = async (): Promise<boolean> => {
    try {
      const algodClient = new algosdk.Algodv2('', ALGORAND_TESTNET_CONFIG.server, '');
      const params = await algodClient.getTransactionParams().do();

      // Check if we're on TestNet by looking at the genesis ID
      const status = await algodClient.status().do();
      const genesisId = params.genesisID;

      // TestNet genesis ID
      const testnetGenesisId = 'testnet-v1.0';

      if (genesisId !== testnetGenesisId) {
        alert(`⚠️ Network Warning!\n\nThis application only works on Algorand TestNet.\n\nDetected network: ${genesisId}\nRequired network: ${testnetGenesisId}\n\nPlease switch your Pera Wallet to TestNet and try again.`);
        return false;
      }

      return true;
    } catch (error) {
      secureLogger.error('Network validation error', error);
      alert('⚠️ Unable to validate network connection. Please ensure you are connected to Algorand TestNet.');
      return false;
    }
  };

  const fetchAccountAssets = async (address: string) => {
    try {
      const algodClient = new algosdk.Algodv2('', ALGORAND_TESTNET_CONFIG.server, '');
      const accountInfo = await algodClient.accountInformation(address).do();

      // Set ALGO balance
      const algoBalance = Number(accountInfo.amount) / 1000000; // Convert microAlgos to Algos

      // Mock HEMP and WEED balances for demonstration
      // In a real app, you would fetch these from the account's assets
      // Detect ASA opt-in and balances
      let hempBal = 0, weedBal = 0, usdcBal = 0;
      let hempIn = false, weedIn = false, usdcIn = false;
      const HEMP_ID = 2675148574;
      const WEED_ID = 2676316280;
      const USDC_ID = 31566704; // TestNet USDC
      if (Array.isArray(accountInfo.assets)) {
        for (const a of accountInfo.assets) {
          const id = (a as any).assetId ?? (a as any)['asset-id'];
          const amtRaw = (a as any).amount as number | bigint | undefined;
          const amt = typeof amtRaw === 'bigint' ? Number(amtRaw) : (amtRaw || 0);
          if (id === HEMP_ID) { hempBal = amt; hempIn = true; }
          if (id === WEED_ID) { weedBal = amt; weedIn = true; }
          if (id === USDC_ID) { usdcBal = amt / 1e6; usdcIn = true; }
        }
      }
      setHempOptedIn(hempIn); setWeedOptedIn(weedIn); setUsdcOptedIn(usdcIn);
      setAccountAssets({
        algo: algoBalance,
        hemp: hempBal,
        weed: weedBal,
        usdc: usdcBal
      });
    } catch (error) {
      secureLogger.error('Error fetching account assets', error);
      enqueueSnackbar('Failed to fetch account assets. Showing mock balances.', { variant: 'warning' });
      // Set mock balances if API call fails
      setAccountAssets({
        algo: 150,
        hemp: 12500000,
        weed: 2500,
        usdc: 1250
      });
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;

    setIsConnecting(true);

    try {
      // First validate we're on TestNet
      const isTestNet = await validateTestNet();
      if (!isTestNet) {
        setIsConnecting(false);
        return;
      }

      // Connect to Pera Wallet
      const accounts = await peraWallet.connect();

      if (accounts && accounts.length > 0) {
        const address = accounts[0];

        // Validate wallet address for security
        if (!validateWalletAddress(address)) {
          enqueueSnackbar('Invalid wallet address format detected', { variant: 'error' });
          setIsConnecting(false);
          return;
        }

        setWalletAddress(address);
        setWalletConnected(true);
        setShowWalletModal(true);

        // Fetch account assets
        await fetchAccountAssets(address);

        secureLogger.log('Pera Wallet connected successfully on TestNet');
        secureLogger.log('Connected address length:', address.length);
      }
    } catch (error: any) {
      secureLogger.error('Wallet connection error', error);

      if (error.message?.includes('User rejected')) {
        alert('Wallet connection was cancelled by user.');
      } else {
        alert(`❌ Failed to connect to Pera Wallet.\n\nError: ${error.message || 'Unknown error'}\n\nPlease ensure:\n• Pera Wallet is installed\n• You are connected to Algorand TestNet\n• Try refreshing the page`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setShowWalletModal(false);
    setAccountAssets({
      algo: 0,
      hemp: 0,
      weed: 0,
      usdc: 0
    });
  };

  const disconnectWallet = async () => {
    try {
      await peraWallet.disconnect();
      handleWalletDisconnect();
      secureLogger.log('Wallet disconnected successfully');
    } catch (error) {
      secureLogger.error('Error disconnecting wallet', error);
      // Force disconnect even if there's an error
      handleWalletDisconnect();
    }
  };

  const switchTab = (tab: string) => { setActiveTab(tab); };

  // Hotkeys: Alt+R refresh, Alt+P pause toggle (vapes tab)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'r' || e.key === 'R')) { if (activeTab === 'vapes' && !loadingProducts) refreshOraclePrices(); }
      if (e.altKey && (e.key === 'p' || e.key === 'P')) { if (activeTab === 'vapes') setPriceFeedPaused(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, loadingProducts]);

  // Example spin handler
  const handleSpin = () => {
    const prize = spinForPrize();
    setLastPrize(prize);
    // TODO: Trigger backend/contract prize distribution here
    if (prize && prize.type !== 'none') {
      const entry = {
        id: 'win_' + Math.random().toString(36).slice(2, 10),
        address: walletConnected && walletAddress ? walletAddress : 'Guest',
        prize: prize.label,
        label: (('description' in prize) ? (prize as any).description : prize.label) || prize.label,
        time: Date.now(),
        tier: prize.type
      };
      setPrizeWinners(w => [entry, ...w].slice(0, 25));
    }
  };

  return (
    <div className="font-sans">
      {/* Asset Opt-In UI (show if not opted in) */}
      {walletConnected && (
        <>
          {!hempOptedIn && <AssetOptIn assetId={2675148574} assetName="HEMP" onOptIn={() => { }} optedIn={hempOptedIn} />}
          {!weedOptedIn && <AssetOptIn assetId={2676316280} assetName="WEED" onOptIn={() => { }} optedIn={weedOptedIn} />}
          {!usdcOptedIn && <AssetOptIn assetId={31566704} assetName="USDC" onOptIn={() => { }} optedIn={usdcOptedIn} />}
        </>
      )}
      {/* Unified Transaction Overlay replaces previous inline TransactionStatus component */}
      <TransactionOverlay
        open={showTxOverlay && txStatus !== 'idle'}
        status={txStatus === 'idle' ? 'pending' : txStatus}
        actionLabel={activeTab === 'staking' ? 'Staking' : activeTab === 'governance' ? 'Voting' : 'Transaction'}
        txId={txId}
        error={txError}
        onClose={() => { setShowTxOverlay(false); if (txStatus !== 'pending') setTxStatus('idle'); }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col items-center mb-8">
          {/* Logo and Title Row */}
          <div className="w-full max-w-5xl mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/CBD%20Logo%20-%20PNG%20File%20-%20Black%20Background%20-%2072dpi%20-%20Web%20Use.png"
                alt="CBD Gold Logo"
                className="h-10 w-10 mr-3 rounded-full"
              />
              <h1 className="text-2xl font-bold">CBD Gold ShopFi</h1>
            </div>
            <div className="flex items-center text-xs space-x-2">
              <div className={`px-2 py-1 rounded-full font-semibold ${backendStatus === 'up' ? 'bg-green-600 text-white' : backendStatus === 'down' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                API: {backendStatus}
              </div>
            </div>

          </div>
          {/* Navigation Tabs Row */}
          <div className="w-full max-w-5xl mb-4">
            <div className="flex flex-row flex-wrap gap-2 items-center justify-between">
              {/* Navigation Tabs */}
              <button
                onClick={() => switchTab('dashboard')}
                className={`flex-1 min-w-[120px] mx-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <FeatherIcon icon="home" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => switchTab('vapes')}
                className={`flex-1 min-w-[120px] mx-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'vapes'
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <FeatherIcon icon="shopping-bag" />
                <span>CBD Gold</span>
              </button>
              <button
                onClick={() => switchTab('staking')}
                className={`flex-1 min-w-[120px] mx-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'staking'
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <FeatherIcon icon="lock" />
                <span>ShopFi</span>
              </button>
              <button
                onClick={() => switchTab('governance')}
                className={`flex-1 min-w-[120px] mx-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'governance'
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <FeatherIcon icon="users" />
                <span>Governance</span>
              </button>
              {/* Wallet Button aligned with tabs */}
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className={`flex-1 min-w-[120px] mx-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${walletConnected
                  ? 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
                  : isConnecting
                    ? 'bg-gradient-to-r from-gray-400 to-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                  }`}
              >
                {isConnecting ? (
                  <>
                    <FeatherIcon icon="loader" className="mr-2 spinning" />
                    <span>Connecting...</span>
                  </>
                ) : walletConnected ? (
                  <>
                    <FeatherIcon icon="check-circle" className="mr-2" />
                    <span>Pera Wallet</span>
                  </>
                ) : (
                  <>
                    <FeatherIcon icon="wallet" className="mr-2" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Centered Claim Prize Button */}
          {hasPrizeToClaim && (
            <button
              className="btn btn-warning mx-auto mt-2"
              onClick={() => setShowClaimModal(true)}
            >
              Claim Prize
            </button>
          )}
        </header>
        {/* Claim Prize Modal */}
        {showClaimModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <PrivacyNotice />
              <ClaimPrize
                userAddress={walletAddress}
                prizeId={"vape-nft-001"}
                onClaimed={() => setShowClaimModal(false)}
              />
              <button className="btn btn-error mt-4 w-full" onClick={() => setShowClaimModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Removed duplicate navigation tabs header */}

        {/* Content Sections */}
        <div id="contentSections">
          {/* Admin Dashboard Section (for demonstration, add real routing/auth later) */}
          {activeTab === 'admin' && <AdminDashboard />}
          {/* Dashboard Section */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8 px-3 sm:px-4 md:px-5 lg:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-6">
                <div className="glass-card rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <FeatherIcon icon="leaf" className="mr-2 text-green-400" />
                      Multi-Token Wallet
                    </h3>
                    {walletConnected && (
                      <button
                        onClick={disconnectWallet}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4 md:p-5 space-y-3">
                    <div>
                      <p className="text-sm text-gray-300">Algorand Address:</p>
                      <p className="font-mono text-xs text-green-400 break-all">
                        {walletConnected ? 'HEMP7X4A3QZXKJYB2NWVF8H5M9GTCR6PLQS1EUDKA8YW3V2TZRI4BJLM6A' : 'Not connected'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-300">HEMP:</p>
                        <p className="text-green-400 font-bold">{walletConnected ? accountAssets.hemp.toLocaleString() : '0'}</p>
                        <p className="text-xs text-gray-500">ASA: 2675148574</p>
                        {oracleMeta?.hempUsd && accountAssets.hemp > 0 && (
                          <p className="text-[11px] text-green-300/80">≈ ${(accountAssets.hemp * oracleMeta.hempUsd).toFixed(2)} USD</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-300">WEED:</p>
                        <p className="text-purple-400 font-bold">{walletConnected ? accountAssets.weed.toLocaleString() : '0'}</p>
                        <p className="text-xs text-gray-500">ASA: 2676316280</p>
                      </div>
                      <div>
                        <p className="text-gray-300">ALGO:</p>
                        <p className="text-blue-400 font-bold">{walletConnected ? accountAssets.algo.toFixed(2) : '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">USDC:</p>
                        <p className="text-yellow-400 font-bold">{walletConnected ? `$${accountAssets.usdc.toFixed(2)}` : '$0.00'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <FeatherIcon icon="award" className="mr-2 text-orange-400" />
                      Staking Tier
                    </h3>
                  </div>
                  <div className={`bg-gradient-to-r ${stakingTier.color} rounded-lg p-4 mb-3`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-black font-bold text-lg">{stakingTier.name} Tier</p>
                        <p className="text-black/80 text-sm">{stakingTier.discount}% Off • {stakingTier.apy}% APY</p>
                      </div>
                      <FeatherIcon icon="award" className="text-black" />
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Staked HEMP:</span>
                      <span className="text-green-400">{stakedHemp.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Shipping:</span>
                      <span className="text-blue-400">{stakingTier.shipping}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Voting Power:</span>
                      <span className="text-purple-400">{(stakedHemp / 1_000_000).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Daily Reward:</span>
                      <span className="text-yellow-400">
                        {(() => {
                          // Simple projection: APY% of staked over 365 days.
                          const daily = stakedHemp * (stakingTier.apy / 100) / 365;
                          return daily < 1 ? daily.toFixed(2) : Math.round(daily).toLocaleString();
                        })()} HEMP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Annual Reward:</span>
                      <span className="text-yellow-300">
                        {(() => {
                          const annual = stakedHemp * (stakingTier.apy / 100);
                          return annual < 1 ? annual.toFixed(2) : Math.round(annual).toLocaleString();
                        })()} HEMP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Earned (Sim):</span>
                      <span className="text-green-300" title="Simulated cumulative rewards; will be replaced by real accrual logic.">{simulatedEarned.toLocaleString()} HEMP</span>
                    </div>
                  </div>
                </div>
                <TransactionHistoryPanel items={txHistory} onClear={() => setTxHistory([])} compact />
                {/* Prize Winners (moved up beside staking tier) */}
                <div className="glass-card rounded-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center"><FeatherIcon icon="award" className="mr-2 text-yellow-400" />Prize Winners</h3>
                    <span className="text-[10px] text-gray-400">Latest</span>
                  </div>
                  {prizeWinners.length === 0 && (
                    <p className="text-gray-400 text-sm">No prize winners yet. Spin to be the first!</p>
                  )}
                  {prizeWinners.length > 0 && (
                    <div className="overflow-x-auto -mx-1">
                      <table className="min-w-full text-[11px] leading-tight">
                        <thead>
                          <tr className="text-gray-400 uppercase tracking-wider text-[10px]">
                            <th className="px-1 py-1 text-left">#</th>
                            <th className="px-1 py-1 text-left">Addr</th>
                            <th className="px-1 py-1 text-left">Prize</th>
                            <th className="px-1 py-1 text-left">Tier</th>
                            <th className="px-1 py-1 text-left">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prizeWinners.map((w, idx) => {
                            const date = new Date(w.time);
                            const shortAddr = w.address === 'Guest' ? 'Guest' : w.address.slice(0, 6) + '...' + w.address.slice(-4);
                            const tierColor = w.tier === 'legendary' ? 'text-purple-300' : w.tier === 'rare' ? 'text-blue-300' : 'text-green-300';
                            return (
                              <tr key={w.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition">
                                <td className="px-1 py-1 text-gray-500 text-[10px]">{idx + 1}</td>
                                <td className="px-1 py-1 font-mono text-[10px]">{shortAddr}</td>
                                <td className="px-1 py-1 truncate max-w-[90px]">{w.prize}</td>
                                <td className={`px-1 py-1 capitalize font-semibold ${tierColor} text-[10px]`}>{w.tier}</td>
                                <td className="px-1 py-1 text-gray-400 text-[10px]" title={date.toLocaleString()}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-6">
                <div className="glass-card rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Available HEMP</p>
                      <p className="text-3xl font-bold text-green-400">0</p>
                      <p className="text-xs text-gray-400">Ready to spend</p>
                    </div>
                    <FeatherIcon icon="leaf" className="text-green-400" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Staked HEMP</p>
                      <p className="text-3xl font-bold text-blue-400">0</p>
                      <p className="text-xs text-gray-400">Earning 0% APY</p>
                    </div>
                    <FeatherIcon icon="lock" className="text-blue-400" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">WEED Governance</p>
                      <p className="text-3xl font-bold text-purple-400">0</p>
                      <p className="text-xs text-gray-400">0 votes</p>
                    </div>
                    <FeatherIcon icon="users" className="text-purple-400" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">LP Contributions</p>
                      <p className="text-3xl font-bold text-yellow-400">0</p>
                      <p className="text-xs text-gray-400">ALGO/HEMP & HEMP/USDC</p>
                    </div>
                    <FeatherIcon icon="trending-up" className="text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price Bar (show only on Dashboard) */}
          {activeTab === 'dashboard' && oracleMeta && (
            <PriceBar
              oracleMeta={oracleMeta}
              lastLiveOracle={lastLiveOracle}
              priceDelta={priceDelta}
              history={priceHistory}
              paused={priceFeedPaused}
              onTogglePaused={() => setPriceFeedPaused(p => !p)}
              onRefresh={refreshOraclePrices}
              loading={loadingProducts}
            />
          )}
          {/* CBD Gold Vapes Section */}
          {activeTab === 'vapes' && (
            <>
              <Suspense fallback={<div className="text-center text-gray-400 py-10">Loading products...</div>}>
                <VapesSection
                  walletConnected={walletConnected}
                  stakedTokens={accountAssets.hemp}
                  algoBalance={accountAssets.algo}
                  usdcBalance={accountAssets.usdc}
                  hempBalance={accountAssets.hemp}
                  weedBalance={accountAssets.weed}
                  products={products}
                  tokenPrices={tokenPrices}
                  oracleMeta={oracleMeta}
                  loading={loadingProducts}
                  onRefreshPrices={refreshOraclePrices}
                  onPurchase={(vape, paymentType, discountedPrice) => {
                    enqueueSnackbar(`Purchasing ${vape.name} with ${paymentType}...`, { variant: 'info' });
                    const tempId = 'purchase_' + Math.random().toString(36).slice(2, 10);
                    pushTxHistory({ id: tempId, label: `Purchase ${vape.name}`, kind: 'purchase', status: 'pending' });
                    runSimTx((status, tx, err) => {
                      setTxStatus(status); setTxId(tx); setTxError(err);
                      if (status === 'pending') setShowTxOverlay(true);
                      if (status !== 'pending') updateTxHistoryStatus(tempId, status, tx ? { txId: tx } : undefined);
                    }, { failRate: 0.05 }).then(r => {
                      if (r.status === 'confirmed') {
                        enqueueSnackbar(`Purchased ${vape.name}! Earned ${vape.hempEarned.toLocaleString()} HEMP`, { variant: 'success' });
                        setTimeout(() => { if (txStatus === 'confirmed') setShowTxOverlay(false); }, 1600);
                      } else if (r.status === 'failed') {
                        enqueueSnackbar(`Purchase failed: ${r.error}`, { variant: 'error' });
                        setTimeout(() => { if (txStatus === 'failed') setShowTxOverlay(false); }, 2400);
                      }
                    });
                  }}
                />
              </Suspense>              {/* Spin for Gold Section */}
              <div className="mt-12">
                <div className="glass-card rounded-2xl p-8 text-center">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
                      <span className="text-4xl mr-3">🎰</span>
                      Spin for Gold
                      <span className="text-4xl ml-3">🎰</span>
                    </h2>
                    <p className="text-gray-300 text-lg">
                      Try your luck! Win HEMP tokens, discounts, or exclusive prizes
                    </p>
                  </div>

                  {lastPrize && (
                    <div className="glass-card rounded-xl p-6 mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                        <FeatherIcon icon="award" className="mr-2 text-yellow-400" />
                        Latest Prize Won!
                      </h3>
                      <div className="text-2xl font-bold text-yellow-400 mb-2">{lastPrize.label}</div>
                      <div className="text-gray-300">{lastPrize.description}</div>
                      {lastPrize.type !== 'none' && (
                        <div className="mt-3 text-green-400 font-semibold">
                          🎉 Congratulations! Your prize is ready to claim!
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col items-center space-y-4">
                    <button
                      onClick={handleSpin}
                      disabled={!walletConnected}
                      className={`px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-105 ${walletConnected
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <FeatherIcon icon="zap" className="inline mr-3" />
                      {walletConnected ? 'SPIN FOR GOLD' : 'Connect Wallet to Spin'}
                      <FeatherIcon icon="zap" className="inline ml-3" />
                    </button>

                    {!walletConnected && (
                      <p className="text-gray-400 text-sm">
                        Connect your Pera Wallet to start spinning for prizes!
                      </p>
                    )}
                  </div>

                  {/* Prize Tiers Display */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="text-green-400 font-bold mb-2">🌿 Common Prizes</div>
                      <div className="text-sm text-gray-300">
                        HEMP Tokens, Small Discounts
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="text-blue-400 font-bold mb-2">💎 Rare Prizes</div>
                      <div className="text-sm text-gray-300">
                        Large Token Rewards, Big Discounts
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="text-purple-400 font-bold mb-2">👑 Legendary Prizes</div>
                      <div className="text-sm text-gray-300">
                        Physical Products, Exclusive NFTs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* HEMP Token Staking Section */}
          {activeTab === 'staking' && (
            <Suspense fallback={<div className="text-center text-gray-400 py-10">Loading staking pools...</div>}><StakingSection
              walletConnected={walletConnected}
              hempBalance={accountAssets.hemp}
              walletAddress={walletAddress}
              onStake={(pool, amount) => {
                enqueueSnackbar(`Staking ${amount.toLocaleString()} HEMP into ${pool.name}...`, { variant: 'info' });
                const tempId = 'stake_' + Math.random().toString(36).slice(2, 10);
                pushTxHistory({ id: tempId, label: `Stake ${amount.toLocaleString()} HEMP`, kind: 'stake', status: 'pending' });
                // Integrity: ensure amount respects pool min & track per-pool state
                if (amount < pool.minStake) {
                  enqueueSnackbar('Amount below pool minimum after formatting', { variant: 'error' });
                  updateTxHistoryStatus(tempId, 'failed');
                  return;
                }
                runSimTx((status, tx, err) => {
                  setTxStatus(status); setTxId(tx); setTxError(err);
                  if (status === 'pending') setShowTxOverlay(true);
                  if (status !== 'pending') updateTxHistoryStatus(tempId, status, tx ? { txId: tx } : undefined);
                }, { failRate: 0.07 }).then(r => {
                  if (r.status === 'confirmed') {
                    enqueueSnackbar(`Staked ${amount.toLocaleString()} HEMP • ${pool.discount}% discount • ${pool.apy}% APY`, { variant: 'success' });
                    setStakedHemp(prev => prev + amount);
                    setStakedByPool(prev => ({ ...prev, [pool.id]: (prev[pool.id] || 0) + amount }));
                    const daily = amount * (pool.apy / 100) / 365; // day fraction
                    setSimulatedEarned(prev => prev + daily);
                    setTimeout(() => { if (txStatus === 'confirmed') setShowTxOverlay(false); }, 1600);
                  } else if (r.status === 'failed') {
                    enqueueSnackbar(`Stake failed: ${r.error}`, { variant: 'error' });
                    setTimeout(() => { if (txStatus === 'failed') setShowTxOverlay(false); }, 2400);
                  }
                });
              }}
              onUnstake={(pool, amount) => {
                enqueueSnackbar(`Unstaking ${amount.toLocaleString()} HEMP from ${pool.name}...`, { variant: 'info' });
                const tempId = 'unstake_' + Math.random().toString(36).slice(2, 10);
                pushTxHistory({ id: tempId, label: `Unstake ${amount.toLocaleString()} HEMP`, kind: 'unstake', status: 'pending' });
                // Integrity: verify user has enough staked in this pool
                const stakedInPool = stakedByPool[pool.id] || 0;
                if (amount > stakedInPool) {
                  enqueueSnackbar('Cannot unstake more than staked in this pool', { variant: 'error' });
                  updateTxHistoryStatus(tempId, 'failed');
                  return;
                }
                runSimTx((status, tx, err) => {
                  setTxStatus(status); setTxId(tx); setTxError(err);
                  if (status === 'pending') setShowTxOverlay(true);
                  if (status !== 'pending') updateTxHistoryStatus(tempId, status, tx ? { txId: tx } : undefined);
                }, { failRate: 0.04 }).then(r => {
                  if (r.status === 'confirmed') {
                    enqueueSnackbar(`Unstaked ${amount.toLocaleString()} HEMP`, { variant: 'success' });
                    setStakedHemp(prev => Math.max(0, prev - amount));
                    setStakedByPool(prev => ({ ...prev, [pool.id]: Math.max(0, (prev[pool.id] || 0) - amount) }));
                    setTimeout(() => { if (txStatus === 'confirmed') setShowTxOverlay(false); }, 1500);
                  } else if (r.status === 'failed') {
                    enqueueSnackbar(`Unstake failed: ${r.error}`, { variant: 'error' });
                    setTimeout(() => { if (txStatus === 'failed') setShowTxOverlay(false); }, 2400);
                  }
                });
              }}
            /></Suspense>
          )}

          {/* WEED Governance Section */}
          {activeTab === 'governance' && (
            <Suspense fallback={<div className="text-center text-gray-400 py-10">Loading governance data...</div>}><GovernanceSection
              walletConnected={walletConnected}
              weedBalance={accountAssets.weed}
              walletAddress={walletAddress}
              onVote={(proposal: GovernanceProposal, weedUsed: number) => {
                enqueueSnackbar(`Submitting vote: ${proposal.title} (using ${weedUsed} WEED)...`, { variant: 'info' });
                const tempId = 'vote_' + Math.random().toString(36).slice(2, 10);
                pushTxHistory({ id: tempId, label: `Vote ${proposal.title}`, kind: 'vote', status: 'pending' });
                runSimTx((status, tx, err) => {
                  setTxStatus(status); setTxId(tx); setTxError(err);
                  if (status === 'pending') setShowTxOverlay(true);
                  if (status !== 'pending') updateTxHistoryStatus(tempId, status, tx ? { txId: tx } : undefined);
                }, { failRate: 0.06 }).then(r => {
                  if (r.status === 'confirmed') {
                    enqueueSnackbar(`Vote recorded for: ${proposal.title}`, { variant: 'success' });
                    setTimeout(() => { if (txStatus === 'confirmed') setShowTxOverlay(false); }, 1500);
                  } else if (r.status === 'failed') {
                    enqueueSnackbar(`Vote failed: ${r.error}`, { variant: 'error' });
                    setTimeout(() => { if (txStatus === 'failed') setShowTxOverlay(false); }, 2400);
                  }
                });
              }}
              onTxStatus={(status, txId, error) => {
                setTxStatus(status);
                setTxId(txId);
                setTxError(error);
                if (status === 'pending') setShowTxOverlay(true);
              }}
            /></Suspense>
          )}
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
                  <FeatherIcon icon="twitter" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">
                  <FeatherIcon icon="instagram" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">
                  <FeatherIcon icon="github" />
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
