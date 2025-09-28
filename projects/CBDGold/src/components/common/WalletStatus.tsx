import React from 'react';
import { useWalletManager } from '../../hooks/useWalletManager';

const WalletStatus: React.FC = () => {
  const { connect, disconnect, connected, connecting, address, assets, refreshAssets } = useWalletManager();

  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/60 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-yellow-400">Wallet</h3>
        {!connected ? (
          <button
            onClick={connect}
            disabled={connecting}
            className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-medium"
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-sm font-medium"
          >
            Disconnect
          </button>
        )}
      </div>
      <div className="text-xs font-mono break-all text-gray-400 min-h-[28px]">
        {connected ? address : 'Not connected'}
      </div>
      {connected && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800 rounded p-2 text-center">
              <p className="text-gray-400 text-xs">ALGO</p>
              <p className="text-blue-400 font-semibold">{assets.algo}</p>
            </div>
            <div className="bg-gray-800 rounded p-2 text-center">
              <p className="text-gray-400 text-xs">HEMP</p>
              <p className="text-green-400 font-semibold">{assets.hemp}</p>
            </div>
            <div className="bg-gray-800 rounded p-2 text-center">
              <p className="text-gray-400 text-xs">WEED</p>
              <p className="text-purple-400 font-semibold">{assets.weed}</p>
            </div>
            <div className="bg-gray-800 rounded p-2 text-center">
              <p className="text-gray-400 text-xs">USDC</p>
              <p className="text-yellow-400 font-semibold">{assets.usdc}</p>
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
        </>
      )}
    </div>
  );
};

export default WalletStatus;
