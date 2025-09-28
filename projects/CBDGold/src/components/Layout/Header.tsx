import React from 'react';
import { useAppContext } from '../../contexts';
import FeatherIcon from '../FeatherIcon';

const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { walletConnected, walletAddress, accountAssets } = state;
  const [open, setOpen] = React.useState(false);

  const connect = () => {
    // Mock connect (until real wallet integration is wired)
    dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: 'HEMP7X4A3QZXKJYB2NWVF8H5M9GTCR6PLQS1EUDKA8YW3V2TZRI4BJLM6A' } });
    dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: { algo: 150, usdc: 1250, hemp: 12_500_000, weed: 2500 } });
    setOpen(true);
  };
  const disconnect = () => {
    dispatch({ type: 'RESET_WALLET' });
    setOpen(false);
  };

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/CBD%20Logo%20-%20PNG%20File%20-%20Black%20Background%20-%2072dpi%20-%20Web%20Use.png" alt="CBD Gold Logo" className="h-10 w-10 rounded-full" />
        </div>
        <button
          onClick={walletConnected ? () => setOpen(true) : connect}
          className={`bg-gradient-to-r px-6 py-2 rounded-full font-semibold transition-all ${walletConnected ? 'from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700' : 'from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'} `}
        >
          {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="glass-card rounded-2xl p-6 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Wallet {walletConnected ? 'Connected' : 'Not Connected'}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white"><FeatherIcon icon="x" /></button>
            </div>
            {walletConnected ? (
              <>
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300 mb-1">Algorand Address:</p>
                  <p className="font-mono text-xs text-green-400 break-all">{walletAddress}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div><p className="text-gray-300">HEMP:</p><p className="text-green-400 font-bold">{accountAssets.hemp.toLocaleString()}</p><p className="text-xs text-gray-500">ASA: 2675148574</p></div>
                  <div><p className="text-gray-300">WEED:</p><p className="text-purple-400 font-bold">{accountAssets.weed.toLocaleString()}</p><p className="text-xs text-gray-500">ASA: 2676316280</p></div>
                  <div><p className="text-gray-300">ALGO:</p><p className="text-blue-400 font-bold">{accountAssets.algo.toFixed(2)}</p></div>
                  <div><p className="text-gray-300">USDC:</p><p className="text-yellow-400 font-bold">${accountAssets.usdc.toFixed(2)}</p></div>
                </div>
                <button onClick={disconnect} className="w-full bg-gradient-to-r from-red-500 to-red-600 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all">Disconnect Wallet</button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No wallet connected.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
