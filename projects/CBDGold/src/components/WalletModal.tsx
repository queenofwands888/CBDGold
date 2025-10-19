// Unified single WalletModal implementation (previous duplicate definitions removed)
import React from 'react';
import FeatherIcon from './FeatherIcon';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  walletAddress: string;
  accountAssets: { algo: number; hemp: number; weed: number; usdc: number };
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onDisconnect, walletAddress, accountAssets }) => {
  if (!isOpen) return null;
  const formatAddress = (address: string) => (!address ? 'Not connected' : `${address.slice(0, 8)}...${address.slice(-8)}`);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card rounded-2xl p-6 max-w-md w-full" data-aos="zoom-in">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-xl font-bold mr-2">Pera Wallet Connected</h3>
            <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">TestNet</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FeatherIcon icon="x" /></button>
        </div>
        <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300 mb-1">Algorand Address:</p>
          <p className="font-mono text-xs text-green-400 break-all" title={walletAddress}>{formatAddress(walletAddress)}</p>
          <p className="text-xs text-gray-500 mt-1">Network: Algorand TestNet</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><p className="text-gray-300">HEMP:</p><p className="text-green-400 font-bold">{accountAssets.hemp.toLocaleString()}</p><p className="text-xs text-gray-500">ASA: 748025551</p></div>
          <div><p className="text-gray-300">WEED:</p><p className="text-purple-400 font-bold">{accountAssets.weed.toLocaleString()}</p><p className="text-xs text-gray-500">ASA: 748025552</p></div>
          <div><p className="text-gray-300">ALGO:</p><p className="text-blue-400 font-bold">{accountAssets.algo.toFixed(2)}</p></div>
          <div><p className="text-gray-300">USDC:</p><p className="text-yellow-400 font-bold">${accountAssets.usdc.toFixed(2)}</p></div>
        </div>
        <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3 mb-4">
          <div className="flex items-center"><FeatherIcon icon="info" className="text-blue-400 mr-2 w-4 h-4" /><p className="text-xs text-blue-300">Connected to Algorand TestNet via Pera Wallet</p></div>
        </div>
        <button onClick={onDisconnect} className="w-full bg-gradient-to-r from-red-500 to-red-600 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all">Disconnect Pera Wallet</button>
      </div>
    </div>
  );
};

export default WalletModal;

