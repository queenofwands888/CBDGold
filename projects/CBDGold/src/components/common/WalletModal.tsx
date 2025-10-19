import React from 'react';
import { useWallet } from '@txnlab/use-wallet-react';



import { WalletId } from '@txnlab/use-wallet';
import { useWalletManager } from '../../hooks/useWalletManager';
import type { Wallet as UseWalletType } from '@txnlab/use-wallet-react';
import { logger } from '../../utils/logger';
import { chainConfig } from '../../onchain/env';
import { getNetworkLabel, isTestNet } from '../../onchain/network';

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallets, activeAddress } = useWallet();
  const { connect, disconnect, connected } = useWalletManager();
  const networkLabel = React.useMemo(() => getNetworkLabel(), []);
  const onChain = chainConfig.mode === 'onchain';
  const testNet = React.useMemo(() => isTestNet(), []);
  const tipMessage = onChain
    ? `Tip: Use WalletConnect to scan a QR from Pera on ${networkLabel}.`
    : 'Tip: Connect a wallet provider to explore the simulation experience.';

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
          {wallets?.map((wallet: UseWalletType) => (
            <WalletRow
              key={wallet.id}
              wallet={wallet}
              onConnect={connect}
              onClose={onClose}
            />
          ))}
        </div>
        <div className="space-y-1 text-center">
          <p className="text-[11px] text-gray-400">{tipMessage}</p>
          {onChain && testNet && (
            <p className="text-[10px] text-red-300 uppercase tracking-[0.2em]">TestNet only — never send MainNet funds.</p>
          )}
        </div>

        {connected && (
          <button
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold transition-all"
            onClick={async () => {
              await disconnect();
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

const WalletRow: React.FC<{ wallet: UseWalletType; onConnect: (walletId: WalletId) => Promise<void>; onClose: () => void }> = ({ wallet, onConnect, onClose }) => {
  const isActive = wallet.isActive;
  const meta = wallet.metadata;
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${isActive ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
      onClick={async () => {
        try {
          await onConnect(wallet.id);
          onClose();
        } catch (error) {
          logger.warn('wallet connect failed', error);
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
