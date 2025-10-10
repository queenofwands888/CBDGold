import { useState } from 'react';
import { AppProvider, TransactionProvider, useAppContext } from './contexts';
import DashboardPanel from './components/sections/DashboardPanel';
import VapesSection from './components/sections/VapesSection';
import StakingPanel from './components/sections/StakingPanel';
import GovernancePanel from './components/sections/GovernancePanel';
import SpinGamePanel from './components/sections/SpinGamePanel';
import WalletModal from './components/WalletModal';
import './styles/hf-style.css';

const NAV_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'vapes', label: 'CBD Gold', icon: 'shopping-bag' },
  { key: 'staking', label: 'ShopFi', icon: 'lock' },
  { key: 'governance', label: 'Governance', icon: 'users' },
];

function MainContent() {
  const { state, dispatch } = useAppContext();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleTabSwitch = (tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 px-4 pt-8">
        <div className="flex items-center">
          <img src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/CBD%20Logo%20-%20PNG%20File%20-%20Black%20Background%20-%2072dpi%20-%20Web%20Use.png" alt="CBD Gold Logo" className="h-10 w-10 mr-3 rounded-full" />
          <h1 className="text-2xl font-bold">CBD Gold ShopFi</h1>
        </div>
        <button
          className="bg-gradient-to-r from-green-400 to-green-600 px-6 py-2 rounded-full font-semibold hover:from-green-500 hover:to-green-700 transition-all"
          onClick={() => setWalletModalOpen(true)}
        >
          {state.walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2 mb-8 px-4" data-nav-tabs>
        {NAV_TABS.map(tab => (
          <button
            key={tab.key}
            data-tab={tab.key}
            className={`tab-btn flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${state.activeTab === tab.key ? 'bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg scale-105' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            onClick={() => handleTabSwitch(tab.key)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content Sections */}
      <main className="flex-1 container mx-auto px-4 pb-8">
        {state.activeTab === 'dashboard' && <DashboardPanel />}
        {state.activeTab === 'vapes' && <VapesSection products={[]} walletConnected={state.walletConnected} stakedTokens={state.stakedAmount} algoBalance={state.accountAssets.algo} usdcBalance={state.accountAssets.usdc} hempBalance={state.accountAssets.hemp} tokenPrices={{}} onPurchase={() => {}} />}
        {state.activeTab === 'staking' && <StakingPanel />}
        {state.activeTab === 'governance' && <GovernancePanel />}
        {/* Spin Game always available at bottom of dashboard */}
        {state.activeTab === 'dashboard' && (
          <div className="max-w-xl mx-auto mt-10">
            <SpinGamePanel />
          </div>
        )}
      </main>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onDisconnect={() => dispatch({ type: 'RESET_WALLET' })}
        walletAddress={state.walletAddress}
        accountAssets={state.accountAssets}
      />

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
                <a href="#" className="text-gray-400 hover:text-green-400 transition">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">Discord</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition">GitHub</a>
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

export default function App() {
  return (
    <AppProvider>
      <TransactionProvider>
        <MainContent />
      </TransactionProvider>
    </AppProvider>
  );
}