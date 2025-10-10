
import React from 'react';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';

const WalletConnectButton: React.FC = () => {
  const {
    wallets,
  // activeWallet,
    activeAccount,
    isReady
  } = useWallet();

  // Find WalletConnect wallet
  const walletConnect = wallets.find(w => w.id === WalletId.WALLETCONNECT);

  if (!isReady) {
    return <div className="text-gray-400">Loading wallets...</div>;
  }

  if (!walletConnect) {
    return <div className="text-red-500">WalletConnect not available</div>;
  }

  const isConnected = walletConnect.isConnected;
  const isActive = walletConnect.isActive;

  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/60 space-y-3">
      <h3 className="font-semibold text-yellow-400">WalletConnect</h3>
      {isConnected && isActive && activeAccount ? (
        <>
          <div className="text-xs font-mono break-all text-green-400 mb-2">
            Connected: {activeAccount.address}
          </div>
          <button
            onClick={() => walletConnect.disconnect()}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-sm font-medium"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => walletConnect.connect()}
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium"
        >
          Connect with WalletConnect
        </button>
      )}
    </div>
  );
};

export default WalletConnectButton;
