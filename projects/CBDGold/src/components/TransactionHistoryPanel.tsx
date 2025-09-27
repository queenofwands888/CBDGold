import React from 'react';
import FeatherIcon from './FeatherIcon';

export interface TxHistoryItem {
  id: string;
  label: string;
  kind: 'purchase' | 'stake' | 'unstake' | 'vote' | 'other';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: number; // epoch ms
  txId?: string; // optional on-chain transaction id
}

interface Props {
  items: TxHistoryItem[];
  onClear?: () => void;
  enableFilter?: boolean;
  compact?: boolean;
}

const statusColor: Record<TxHistoryItem['status'], string> = {
  pending: 'text-yellow-400',
  confirmed: 'text-green-400',
  failed: 'text-red-400'
};

export const TransactionHistoryPanel: React.FC<Props> = ({ items, onClear, enableFilter = true, compact = false }) => {
  const [filter, setFilter] = React.useState<'all' | TxHistoryItem['kind']>('all');
  const filtered = filter === 'all' ? items : items.filter(i => i.kind === filter);
  return (
    <div className={`glass-card rounded-2xl ${compact ? 'p-4' : 'p-6'} h-full flex flex-col`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold flex items-center text-white`}>          <FeatherIcon icon="clock" className="mr-2 text-blue-400" /> Recent Tx
        </h3>
        <div className="flex items-center space-x-2">
          {enableFilter && items.length > 0 && (
            <div className="flex space-x-1 text-[10px]">
              {['all', 'purchase', 'stake', 'unstake', 'vote', 'other'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-2 py-1 rounded-md capitalize transition border border-transparent ${filter === f ? 'bg-blue-600 text-white' : 'bg-black/30 text-gray-300 hover:border-blue-500'}`}
                >{f}</button>
              ))}
            </div>
          )}
          {items.length > 0 && (
            <button onClick={onClear} className="text-[10px] text-gray-500 hover:text-red-400 transition">Clear</button>
          )}
        </div>
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-gray-400">No {filter === 'all' ? '' : filter + ' '}transactions.</p>
      )}
      <ul className={`overflow-y-auto pr-2 ${compact ? 'space-y-1 max-h-52 text-[11px]' : 'space-y-2 max-h-64 text-sm'}`}>
        {filtered.map(tx => (
          <li key={tx.id} className={`flex items-start justify-between bg-black/30 rounded-md ${compact ? 'py-1.5 px-2' : 'py-2 px-3'}`}>
            <div className="flex flex-col pr-2">
              <span className="text-gray-200 font-medium leading-tight break-words">{tx.label}</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wide">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {tx.txId && (
                <a
                  href={`https://testnet.algoexplorer.io/tx/${tx.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={tx.txId}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline break-all mt-1"
                >{tx.txId.slice(0, 8)}…</a>
              )}
            </div>
            <div className={`flex items-center space-x-1 font-semibold ${statusColor[tx.status]}`}>
              {tx.status === 'pending' && <FeatherIcon icon="loader" className="spinning" />}
              {tx.status === 'confirmed' && <FeatherIcon icon="check" />}
              {tx.status === 'failed' && <FeatherIcon icon="alert-triangle" />}
              <span className="capitalize">{tx.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistoryPanel;
