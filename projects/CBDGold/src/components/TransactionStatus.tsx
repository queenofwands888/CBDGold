import React from 'react';
import { chainConfig } from '../onchain/env';
import { getNetworkLabel } from '../onchain/network';
import { getTxnUrl, explorerName } from '../utils/explorer';

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'confirmed' | 'failed';
  txId?: string;
  error?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, txId, error }) => {
  if (status === 'idle') return null;

  const onChain = chainConfig.mode === 'onchain';
  const networkLabel = getNetworkLabel();

  if (status === 'pending') {
    const message = onChain
      ? `Transaction pending on Algorand ${networkLabel}…`
      : 'Transaction pending (simulation)…';
    return <div className="text-yellow-500">{message}</div>;
  }

  if (status === 'confirmed') {
    return (
      <div className="text-green-500">
        {onChain ? 'Transaction confirmed!' : 'Simulation marked as confirmed.'}
        {onChain && txId && (
          <a href={getTxnUrl(txId)} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
            View on {explorerName()}
          </a>
        )}
      </div>
    );
  }

  if (status === 'failed') return <div className="text-red-500">Transaction failed: {error}</div>;
  return null;
};

export default TransactionStatus;
