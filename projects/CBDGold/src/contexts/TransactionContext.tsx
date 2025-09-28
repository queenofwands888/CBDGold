import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { TxHistoryItem } from '../types';

interface TransactionState {
  txHistory: TxHistoryItem[];
  currentTx: {
    status: 'idle' | 'pending' | 'confirmed' | 'failed';
    id?: string;
    error?: string;
  };
}

type TransactionAction =
  | { type: 'ADD_TX'; payload: Omit<TxHistoryItem, 'createdAt'> }
  | { type: 'UPDATE_TX'; payload: { id: string; updates: Partial<TxHistoryItem> } }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_CURRENT_TX'; payload: TransactionState['currentTx'] }
  | { type: 'RESET_CURRENT_TX' };

const initialState: TransactionState = {
  txHistory: [],
  currentTx: { status: 'idle' },
};

function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'ADD_TX':
      return {
        ...state,
        txHistory: [
          { ...action.payload, createdAt: Date.now() },
          ...state.txHistory
        ].slice(0, 25),
      };
    case 'UPDATE_TX':
      return {
        ...state,
        txHistory: state.txHistory.map(tx =>
          tx.id === action.payload.id 
            ? { ...tx, ...action.payload.updates }
            : tx
        ),
      };
    case 'CLEAR_HISTORY':
      return { ...state, txHistory: [] };
    case 'SET_CURRENT_TX':
      return { ...state, currentTx: action.payload };
    case 'RESET_CURRENT_TX':
      return { ...state, currentTx: { status: 'idle' } };
    default:
      return state;
  }
}

const TransactionContext = createContext<{
  state: TransactionState;
  dispatch: React.Dispatch<TransactionAction>;
} | null>(null);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Hydrate tx history
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cbdgold_tx_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.slice(0,25).forEach((tx: any) => {
            // Re-add silently without re-triggering overlay
            dispatch({ type: 'ADD_TX', payload: { id: tx.id, type: tx.type, status: tx.status, note: tx.note, amount: tx.amount } });
            if (tx.status === 'pending') {
              dispatch({ type: 'UPDATE_TX', payload: { id: tx.id, updates: { status: 'failed', note: 'Expired pending on reload' } } });
            }
          });
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => {
    try { localStorage.setItem('cbdgold_tx_history', JSON.stringify(state.txHistory)); } catch {}
  }, [state.txHistory]);
  
  return (
    <TransactionContext.Provider value={{ state, dispatch }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within TransactionProvider');
  }
  return context;
};