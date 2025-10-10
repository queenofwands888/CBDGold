import React from 'react';
// import { useTransactionContext } from '../../contexts';

interface TransactionOverlayProps {
  open: boolean;
  status: 'pending' | 'confirmed' | 'failed';
  actionLabel?: string;
  txId?: string;
  error?: string;
  onClose: () => void;
}

const TransactionOverlay: React.FC<TransactionOverlayProps> = ({
  open,
  status,
  actionLabel = 'Transaction',
  txId,
  error,
  onClose
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
        <div className="text-center space-y-4">
          {status === 'pending' && (
            <>
              <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto" />
              <h3 className="text-lg font-semibold">{actionLabel} Processing</h3>
              <p className="text-sm text-gray-400">Please wait while your transaction is processed on-chain...</p>
            </>
          )}
          {status === 'confirmed' && (
            <>
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center mx-auto">✅</div>
              <h3 className="text-lg font-semibold text-green-400">{actionLabel} Confirmed</h3>
              <p className="text-sm text-gray-400">Success! Your transaction was finalized.</p>
              {txId && (
                <p className="text-[10px] break-all font-mono text-gray-500">TX: {txId}</p>
              )}
            </>
          )}
          {status === 'failed' && (
            <>
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center mx-auto">✕</div>
              <h3 className="text-lg font-semibold text-red-400">{actionLabel} Failed</h3>
              <p className="text-sm text-gray-400">{error || 'An error occurred.'}</p>
            </>
          )}
          {status !== 'pending' && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-medium transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionOverlay;
