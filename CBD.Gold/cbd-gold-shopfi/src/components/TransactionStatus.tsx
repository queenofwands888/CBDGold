import React from 'react';

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'confirmed' | 'failed';
  txId?: string;
  error?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, txId, error }) => {
  if (status === 'idle') return null;
  if (status === 'pending') return <div className="text-yellow-500">Transaction pending...</div>;
  if (status === 'confirmed') return <div className="text-green-500">Transaction confirmed! {txId && <a href={`https://testnet.algoexplorer.io/tx/${txId}`} target="_blank" rel="noopener noreferrer">View on AlgoExplorer</a>}</div>;
  if (status === 'failed') return <div className="text-red-500">Transaction failed: {error}</div>;
  return null;
};

export default TransactionStatus;
