import { useCallback } from 'react';
import { simulateTransaction, SimulatedTxOptions } from '../utils/txSimulator';

export interface UseSimulatedTxResult {
  run: (cb: (status: 'pending' | 'confirmed' | 'failed', txId?: string, error?: string) => void, opts?: SimulatedTxOptions) => Promise<{ status: 'confirmed' | 'failed'; txId?: string; error?: string }>;
}

// Simple hook wrapper to unify how we call simulateTransaction (prep for real on-chain integration)
export function useSimulatedTx(): UseSimulatedTxResult {
  const run = useCallback((cb: (status: 'pending' | 'confirmed' | 'failed', txId?: string, error?: string) => void, opts?: SimulatedTxOptions) => {
    const { promise } = simulateTransaction(cb, opts);
    return promise;
  }, []);
  return { run };
}

export default useSimulatedTx;
