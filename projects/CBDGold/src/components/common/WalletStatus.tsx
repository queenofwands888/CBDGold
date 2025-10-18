import React, { useMemo, useState } from 'react';
import { useWalletManager } from '../../hooks/useWalletManager';
import WalletModal from './WalletModal';
import TreasuryWallet from './TreasuryWallet';
import HotWallet from './HotWallet';

const WalletStatus: React.FC = () => {
  const { connected, connecting, address, assets, refreshAssets } = useWalletManager();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-brand-emerald">Wallet</h3>
        {!connected ? (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={connecting}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 disabled:opacity-50 text-black text-sm font-bold transition-all shadow-lg"
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold transition-all shadow-lg"
          >
            Wallet
          </button>
        )}
      </div>
      <div className="text-xs font-mono break-all text-gray-300 bg-black/20 rounded-lg p-3 min-h-[44px]">
        {connected ? address : 'Not connected'}
      </div>
      {connected && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-black/30 border border-blue-500/20 rounded-lg p-3 text-center hover:border-blue-400/40 transition-all">
              <p className="text-gray-400 text-xs mb-1">ALGO</p>
              <p className="text-blue-400 font-bold text-lg">{assets.algo}</p>
            </div>
            <div className="bg-black/30 border border-green-500/20 rounded-lg p-3 text-center hover:border-green-400/40 transition-all">
              <p className="text-gray-400 text-xs mb-1">HEMP</p>
              <p className="text-green-400 font-bold text-lg">{assets.hemp}</p>
            </div>
            <div className="bg-black/30 border border-purple-500/20 rounded-lg p-3 text-center hover:border-purple-400/40 transition-all">
              <p className="text-gray-400 text-xs mb-1">WEED</p>
              <p className="text-purple-400 font-bold text-lg">{assets.weed}</p>
            </div>
            <div className="bg-black/30 border border-yellow-500/20 rounded-lg p-3 text-center hover:border-yellow-400/40 transition-all">
              <p className="text-gray-400 text-xs mb-1">USDC</p>
              <p className="text-yellow-400 font-bold text-lg">{assets.usdc}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshAssets}
              className="flex-1 px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-xs"
            >
              Refresh Assets
            </button>
          </div>
          {/* Receive Test ALGO helper */}
          <ReceiveTestAlgo address={address} onRefresh={refreshAssets} />
          <TreasuryWallet />
          <HotWallet />
        </>
      )}
      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

const ReceiveTestAlgo: React.FC<{ address?: string; onRefresh: () => void }> = ({ address, onRefresh }) => {
  const faucetUrl = useMemo(() => `https://bank.testnet.algorand.network/`, []);
  if (!address) return null;
  return (
    <div className="mt-2 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
      <p className="text-xs text-gray-300 mb-2 text-center">Fund your TestNet address with the official faucet</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <a className="btn-secondary text-xs" href={faucetUrl} target="_blank" rel="noreferrer">Open TestNet Faucet</a>
        <button className="btn-primary text-xs" onClick={onRefresh}>Refresh Balance</button>
      </div>
    </div>
  );
};

export default WalletStatus;
