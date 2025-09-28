// Clean minimal root App component (fully purged of previous duplicated inline component code)
import React from 'react';
import { SnackbarProvider } from 'notistack';
import { AppProvider, TransactionProvider } from './contexts';
import MainLayout from './components/Layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/hf-style.css';
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
import { useMemo } from 'react';
import { CBD_VAPES } from './data/constants';
import { usePersistentState } from './hooks/usePersistentState';
import TransactionHistoryPanel from './components/sections/TransactionHistoryPanel';
import SpinGamePanel from './components/sections/SpinGamePanel';
import ContractStatePanel from './components/sections/ContractStatePanel';
import PrizeLegend from './components/common/PrizeLegend';

// Internal component to bridge overlay & dev trigger while routing not yet wired
const AppShell: React.FC = () => {
  const { state: txState, dispatch } = useTransactionContext();
  const { state: appState } = useAppContext();
  usePersistentState();
  const { simulate, resetCurrent } = useSimulatedTransaction();
  const { currentTx } = txState;
  const tokenPrices = useMemo(() => ({ HEMP: 0.00025 }), []);
  const oracleMeta = useMemo(() => ({ source: { backend: false, fallback: true }, lastUpdated: Date.now() - 15000 }), []);

  const showOverlay = currentTx.status !== 'idle';

  return (
    <>
      <MainLayout>
        <Hero />
        <div className="flex items-center justify-between mb-6" data-nav-tabs>
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
                oracleMeta={oracleMeta as any}
                onPurchase={(vape, method, price) => {
                  // Placeholder: additional side-effects (analytics, post-purchase modal) could be inserted here
                  console.log('[purchase-event]', { id: vape.id, method, price });
                }}
              />
            )}
            <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/60">
              <h2 className="font-semibold mb-2 text-yellow-400">Development Controls</h2>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => simulate('demo')}
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium"
                  disabled={currentTx.status === 'pending'}
                >
                  {currentTx.status === 'pending' ? 'Processing...' : 'Simulate Transaction'}
                </button>
                {currentTx.status !== 'idle' && currentTx.status !== 'pending' && (
                  <button
                    onClick={resetCurrent}
                    className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                  >
                    Reset Overlay
                  </button>
                )}
              </div>
              <p className="text-xs mt-2 text-gray-400">Temporary panel for testing state & overlay.</p>
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

const App: React.FC = () => (
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    autoHideDuration={5000}
  >
    <ErrorBoundary>
      <AppProvider>
        <TransactionProvider>
          <AppShell />
        </TransactionProvider>
      </AppProvider>
    </ErrorBoundary>
  </SnackbarProvider>
);

export default App;
