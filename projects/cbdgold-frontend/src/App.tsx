import React from 'react';
import WalletConnection from './components/WalletConnection';
import Dashboard from './components/Dashboard';
import VapesShop from './components/VapesShop';
import StakingPools from './components/StakingPools';
import Governance from './components/Governance';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'shop' | 'staking' | 'governance'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white font-sans">
      <header className="flex justify-between items-center p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="CBD Gold Logo" className="h-10 w-10 rounded-full" />
          <h1 className="text-2xl font-bold">CBD Gold ShopFi</h1>
        </div>
        <WalletConnection />
      </header>
      <nav className="flex justify-center gap-4 py-4">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'font-bold text-green-400' : ''}>Dashboard</button>
        <button onClick={() => setActiveTab('shop')} className={activeTab === 'shop' ? 'font-bold text-green-400' : ''}>Shop</button>
        <button onClick={() => setActiveTab('staking')} className={activeTab === 'staking' ? 'font-bold text-green-400' : ''}>Staking</button>
        <button onClick={() => setActiveTab('governance')} className={activeTab === 'governance' ? 'font-bold text-green-400' : ''}>Governance</button>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'shop' && <VapesShop />}
        {activeTab === 'staking' && <StakingPools />}
        {activeTab === 'governance' && <Governance />}
      </main>
      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12">
        <div>© 2025 CBD Gold ShopFi. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default App;
