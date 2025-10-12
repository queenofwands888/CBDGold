import React from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import type { Wallet as UseWalletType } from '@txnlab/use-wallet-react';

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallets, activeAddress, activeWallet } = useWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md mx-3 rounded-xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Connect Wallet</h3>
          <button className="text-sm text-gray-300 hover:text-white" onClick={onClose}>Close</button>
        </div>

        {activeAddress && (
          <div className="text-xs font-mono break-all text-gray-300 bg-black/20 rounded-lg p-3">
            Active: {activeAddress}
          </div>
        )}

        <div className="space-y-2">
          {wallets?.map((wallet) => (
            <WalletRow key={wallet.id} wallet={wallet as UseWalletType} onClose={onClose} />
          ))}
        </div>
        <p className="text-[11px] text-gray-400 text-center">
          Tip: Use WalletConnect to scan a QR from Pera Mobile on TestNet.
        </p>

        {activeWallet && (
          <button
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold transition-all"
            onClick={async () => {
              await activeWallet.disconnect().catch(() => { });
              onClose();
            }}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};

const WalletRow: React.FC<{ wallet: UseWalletType; onClose: () => void }> = ({ wallet, onClose }) => {
  const isActive = wallet.isActive;
  const meta = wallet.metadata;
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${isActive ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
      onClick={async () => {
        try {
          if (!isActive) {
            await wallet.connect();
          }
          onClose();
        } catch (e) {
          // no-op
        }
      }}
    >
      {meta?.icon ? (
        <img src={meta.icon} alt={meta.name} className="w-6 h-6 object-contain" />
      ) : (
        <div className="w-6 h-6 rounded bg-white/10" />
      )}
      <div className="flex-1 text-left">
        <div className="text-sm font-semibold">{meta?.name || wallet.id}</div>
        <div className="text-[11px] text-gray-400">{isActive ? 'Active' : 'Click to connect'}</div>
      </div>
      {isActive && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Active</span>}
    </button>
  );
};

export default WalletModal;
