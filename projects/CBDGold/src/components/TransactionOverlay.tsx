import React from 'react';
import FeatherIcon from './FeatherIcon';
import { chainConfig } from '../onchain/env';
import { getNetworkLabel, isTestNet } from '../onchain/network';
import { getTxnUrl, explorerName } from '../utils/explorer';

export interface TransactionOverlayProps {
  open: boolean;
  status: 'pending' | 'confirmed' | 'failed';
  actionLabel?: string; // e.g. "Staking", "Voting"
  txId?: string;
  error?: string;
  onClose: () => void;
}

/*
  Unified full-screen transaction feedback overlay to reduce repeated UI patterns
  and centralize explorer link handling.
*/
const statusStyles: Record<string, string> = {
  pending: 'from-yellow-500 to-orange-600',
  confirmed: 'from-green-500 to-emerald-600',
  failed: 'from-red-500 to-rose-600'
};

const TransactionOverlay: React.FC<TransactionOverlayProps> = ({ open, status, actionLabel = 'Transaction', txId, error, onClose }) => {
  if (!open) return null;
  const onChain = chainConfig.mode === 'onchain';
  const networkLabel = getNetworkLabel();
  const showTestNetWarning = onChain && isTestNet();
  const explorerLabel = explorerName();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md relative" data-aos="zoom-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white" aria-label="Close overlay">
          <FeatherIcon icon="x" />
        </button>
        <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${statusStyles[status]} flex items-center justify-center shadow-lg`}>
          {status === 'pending' && <FeatherIcon icon="loader" className="spinning" />}
          {status === 'confirmed' && <FeatherIcon icon="check" />}
          {status === 'failed' && <FeatherIcon icon="alert-triangle" />}
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">
          {status === 'pending' && `${actionLabel} in Progress`}
          {status === 'confirmed' && `${actionLabel} Confirmed`}
          {status === 'failed' && `${actionLabel} Failed`}
        </h3>
        <p className="text-center text-sm text-gray-300 mb-4">
          {status === 'pending' && (onChain ? `Please wait while the transaction is confirmed on Algorand ${networkLabel}.` : 'Simulating transaction flow…')}
          {status === 'confirmed' && (onChain ? 'Your transaction was successfully confirmed on-chain.' : 'Simulation marked as confirmed.')}
          {status === 'failed' && (error || 'The transaction did not complete successfully.')}
        </p>
        <div className="space-y-3">
          {showTestNetWarning && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-center text-red-300">TestNet only — do not send MainNet funds.</p>
          )}
          {txId && (
            <a href={getTxnUrl(txId)} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-blue-400 hover:text-blue-300 underline">
              View on {explorerLabel} →
            </a>
          )}
          <button onClick={onClose} className={`w-full py-3 rounded-lg font-semibold bg-gradient-to-r ${statusStyles[status]} text-black hover:opacity-90 transition-all`}>
            {status === 'pending' ? 'Hide' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionOverlay;
