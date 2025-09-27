// WalletConnection component for Algorand TestNet using Pera Wallet
import React, { useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import WalletModal from './WalletModal';
import { useWallet } from '../hooks/useWallet';

const WalletConnection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, walletInfo, connect, disconnect, isConnecting } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      setIsModalOpen(true);
    } catch (error) {
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleWalletClick = () => {
    if (isConnected) {
      setIsModalOpen(true);
    } else {
      handleConnect();
    }
  };

  return (
    <>
      <button
        onClick={handleWalletClick}
        disabled={isConnecting}
        className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center space-x-2 ${isConnected
            ? 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'
            : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
          } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Wallet size={18} />
        <span>
          {isConnecting
            ? 'Connecting...'
            : isConnected
              ? 'Wallet Connected'
              : 'Connect Wallet'
          }
        </span>
      </button>
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default WalletConnection;
