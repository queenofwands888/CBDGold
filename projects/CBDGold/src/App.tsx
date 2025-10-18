// Clean minimal root App component (fully purged of previous duplicated inline component code)
import React, { useMemo } from 'react';
import MainLayout from './components/Layout/MainLayout';
import TransactionOverlay from './components/common/TransactionOverlay';
import { useTransactionContext, useAppContext } from './contexts';
import NavigationTabs from './components/common/NavigationTabs';
import ChainModeBadge from './components/common/ChainModeBadge';
import WalletStatus from './components/common/WalletStatus';
import DashboardPanel from './components/sections/DashboardPanel';
import StakingPanel from './components/sections/StakingPanel';
import GovernancePanel from './components/sections/GovernancePanel';
import Hero from './components/Hero/Hero';
import VapesSection from './components/sections/VapesSection';
import { CBD_VAPES } from './data/constants';
import { usePersistentState } from './hooks/usePersistentState';
import TransactionHistoryPanel from './components/sections/TransactionHistoryPanel';
import SpinGamePanel from './components/sections/SpinGamePanel';
import PriceBar from './components/PriceBar';
import { useOracleTicker } from './hooks/useOracleTicker';
import { logger } from './utils/logger';
import BrandWalletDirectory from './components/common/BrandWalletDirectory';

const App: React.FC = () => {
  const { state: txState, dispatch } = useTransactionContext();
  const { state: appState } = useAppContext();
  usePersistentState();
  const { currentTx } = txState;
  const {
    oracle,
    lastLiveOracle,
    history: oracleHistory,
    priceDelta,
  } = useOracleTicker();
  const tokenPrices = useMemo((): { HEMP: number; WEED: number; ALGO: number; USDC: number } => ({
    HEMP: oracle?.hempUsd ?? 0.0001,
    WEED: oracle?.weedUsd ?? 0.00008,
    ALGO: oracle?.algoUsd ?? 0.25,
    USDC: oracle?.usdcUsd ?? 1,
  }), [oracle]);

  const overlayStatus = (currentTx.status === 'pending' || currentTx.status === 'confirmed' || currentTx.status === 'failed')
    ? currentTx.status
    : null;

  return (
    <>
      <MainLayout>
        <Hero />
        <PriceBar
          oracleMeta={oracle}
          lastLiveOracle={lastLiveOracle}
          priceDelta={priceDelta}
          history={oracleHistory}
        />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8" data-nav-tabs>
          <NavigationTabs />
          <ChainModeBadge />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3 space-y-6">
            {appState.activeTab === 'dashboard' && <DashboardPanel />}
            {appState.activeTab === 'shopfi' && <StakingPanel />}
            {appState.activeTab === 'governance' && <GovernancePanel />}
            {appState.activeTab === 'vapes' && (
              <VapesSection
                walletConnected={appState.walletConnected}
                stakedTokens={appState.stakedAmount}
                algoBalance={appState.accountAssets.algo}
                usdcBalance={appState.accountAssets.usdc}
                hempBalance={appState.accountAssets.hemp}
                products={CBD_VAPES.map(v => ({
                  id: v.id,
                  name: v.name,
                  type: v.type,
                  flavor: v.flavor,
                  effects: v.effects,
                  prices: { algo: v.priceAlgo, usdc: v.priceUsdc, hemp: v.hempEarned },
                  potency: v.potency,
                  terpenes: v.terpenes,
                  color: v.color,
                  emoji: v.emoji,
                  hempEarned: v.hempEarned,
                  image: v.image
                }))}
                tokenPrices={tokenPrices}
                onPurchase={(vape, method, price) => {
                  // Placeholder: additional side-effects (analytics, post-purchase modal) could be inserted here
                  logger.info('purchase-event', { id: vape.id, method, price });
                }}
              />
            )}
          </div>
          <div className="space-y-6">
            <WalletStatus />
            <BrandWalletDirectory />
            <TransactionHistoryPanel />
            <SpinGamePanel tokenPrices={tokenPrices} />
          </div>
        </div>
      </MainLayout>
      {overlayStatus && (
        <TransactionOverlay
          open
          status={overlayStatus}
          txId={currentTx.id}
          error={currentTx.error}
          onClose={() => dispatch({ type: 'RESET_CURRENT_TX' })}
        />
      )}
    </>
  );
};

export default App;
