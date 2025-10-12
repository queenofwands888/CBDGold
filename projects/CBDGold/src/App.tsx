// Clean minimal root App component (fully purged of previous duplicated inline component code)
import React, { useMemo } from 'react';
import MainLayout from './components/Layout/MainLayout';
import TransactionOverlay from './components/common/TransactionOverlay';
import { useTransactionContext, useAppContext } from './contexts';
import { useSimulatedTransaction } from './hooks/useSimulatedTransaction';
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
import ContractStatePanel from './components/sections/ContractStatePanel';
import PrizeLegend from './components/common/PrizeLegend';
import PriceBar from './components/PriceBar';
import { useOracleTicker } from './hooks/useOracleTicker';
import { logger } from './utils/logger';

const App: React.FC = () => {
  const { state: txState, dispatch } = useTransactionContext();
  const { state: appState } = useAppContext();
  usePersistentState();
  const { simulate, resetCurrent } = useSimulatedTransaction();
  const { currentTx } = txState;
  const {
    oracle,
    lastLiveOracle,
    history: oracleHistory,
    priceDelta,
    paused: oraclePaused,
    loading: oracleLoading,
    refresh: refreshOracle,
    togglePaused: toggleOraclePaused,
  } = useOracleTicker();
  const tokenPrices = useMemo(() => ({
    HEMP: oracle?.hempUsd ?? 0.0001,
    WEED: oracle?.weedUsd ?? 0.00008,
    ALGO: oracle?.algoUsd ?? 0.25,
    USDC: oracle?.usdcUsd ?? 1,
  }), [oracle]);

  const showOverlay = currentTx.status !== 'idle';

  return (
    <>
      <MainLayout>
        <Hero />
        <PriceBar
          oracleMeta={oracle}
          lastLiveOracle={lastLiveOracle}
          priceDelta={priceDelta}
          history={oracleHistory}
          paused={oraclePaused}
          onTogglePaused={toggleOraclePaused}
          onRefresh={refreshOracle}
          loading={oracleLoading}
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
                weedBalance={appState.accountAssets.weed}
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
                  hempEarned: v.hempEarned
                }))}
                tokenPrices={tokenPrices}
                oracleMeta={oracle as any}
                onPurchase={(vape, method, price) => {
                  // Placeholder: additional side-effects (analytics, post-purchase modal) could be inserted here
                  logger.info('purchase-event', { id: vape.id, method, price });
                }}
              />
            )}
            <div className="glass-card p-6 rounded-2xl border border-yellow-500/20">
              <h2 className="font-semibold mb-4 text-yellow-400 text-center">Development Controls</h2>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={() => simulate('demo')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={currentTx.status === 'pending'}
                >
                  {currentTx.status === 'pending' ? 'Processing...' : 'Simulate Transaction'}
                </button>
                {currentTx.status !== 'idle' && currentTx.status !== 'pending' && (
                  <button
                    onClick={resetCurrent}
                    className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Reset Overlay
                  </button>
                )}
              </div>
              <p className="text-xs mt-4 text-gray-400 text-center">Temporary panel for testing state & overlay.</p>
            </div>
          </div>
          <div className="space-y-6">
            <WalletStatus />
            <ContractStatePanel />
            <TransactionHistoryPanel />
            <SpinGamePanel />
            <PrizeLegend />
          </div>
        </div>
      </MainLayout>
      <TransactionOverlay
        open={showOverlay}
        status={currentTx.status as any}
        actionLabel={currentTx.status === 'pending' ? 'Simulated Tx' : 'Transaction'}
        txId={currentTx.id}
        error={currentTx.error}
        onClose={() => dispatch({ type: 'RESET_CURRENT_TX' })}
      />
    </>
  );
};

export default App;
