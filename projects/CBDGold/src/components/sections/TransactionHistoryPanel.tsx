import React from 'react';
import { useTransactionContext } from '../../contexts';

const statusColor = (s: string) => {
  switch (s) {
    case 'confirmed': return 'text-green-400';
    case 'failed': return 'text-red-400';
    case 'pending': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

const TransactionHistoryPanel: React.FC = () => {
  const { state } = useTransactionContext();
  return (
    <div className="glass-card rounded-2xl p-4">
      <h3 className="text-white font-bold mb-3 text-sm tracking-wide">Recent Transactions</h3>
      <div className="space-y-2 max-h-72 overflow-auto pr-1">
        {state.txHistory.length === 0 && <p className="text-xs text-gray-500">No transactions yet.</p>}
        {state.txHistory.map(tx => (
          <div key={tx.id} className="flex items-start justify-between text-xs bg-black/30 rounded-lg p-2">
            <div className="flex-1 pr-2">
              <p className="text-gray-300 font-semibold">{tx.type}</p>
              {tx.note && <p className="text-gray-500 truncate w-40">{tx.note}</p>}
              <p className="text-[10px] text-gray-600">{new Date(tx.createdAt).toLocaleTimeString()}</p>
            </div>
            <div className={`font-bold ${statusColor(tx.status)}`}>{tx.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistoryPanel;
