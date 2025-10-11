import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { TxHistoryItem } from '../types';
import { secureStorage } from '../utils/storage';
import { logger } from '../utils/logger';

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
  | { type: 'HYDRATE_HISTORY'; payload: TxHistoryItem[] }
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
    case 'HYDRATE_HISTORY':
      return { ...state, txHistory: action.payload.slice(0, 25) };
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
    const stored = secureStorage.getJSON<Partial<TxHistoryItem>[]>('tx_history');
    if (!stored) return;

    try {
      const hydrated = stored
        .filter((tx): tx is Partial<TxHistoryItem> => Boolean(tx && tx.id && tx.type && tx.status))
        .map(tx => {
          const base: TxHistoryItem = {
            id: String(tx.id),
            type: String(tx.type),
            status: tx.status === 'confirmed' || tx.status === 'failed' ? tx.status : 'pending',
            createdAt: typeof tx.createdAt === 'number' ? tx.createdAt : Date.now(),
            note: typeof tx.note === 'string' ? tx.note : undefined,
            amount: typeof tx.amount === 'number' ? tx.amount : undefined
          };
          if (base.status === 'pending') {
            return { ...base, status: 'failed' as const, note: 'Expired pending on reload' };
          }
          return base;
        })
        .slice(0, 25);

      if (hydrated.length) {
        dispatch({ type: 'HYDRATE_HISTORY', payload: hydrated });
      }
    } catch (error) {
      logger.warn('Failed to hydrate tx history from storage', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => {
    const ok = secureStorage.setJSON('tx_history', state.txHistory, { maxBytes: 24_576 });
    if (!ok) {
      logger.warn('Failed to persist tx_history payload; consider trimming history');
    }
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