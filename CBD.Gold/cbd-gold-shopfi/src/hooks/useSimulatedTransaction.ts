import { useTransactionContext } from '../contexts';
import { useCallback } from 'react';

export function useSimulatedTransaction() {
  const { dispatch } = useTransactionContext();

  const simulate = useCallback(async (type: string = 'test') => {
    const id = `sim-${Date.now()}`;
    dispatch({ type: 'SET_CURRENT_TX', payload: { status: 'pending', id } });
    dispatch({
      type: 'ADD_TX',
      payload: {
        id,
        type,
        status: 'pending',
        note: 'Simulated tx',
        createdAt: Date.now(),
      }
    });

    await new Promise(r => setTimeout(r, 1200));

    const success = Math.random() > 0.15;
    if (success) {
      dispatch({
        type: 'UPDATE_TX',
        payload: {
          id,
          updates: {
            status: 'confirmed',
            txId: `${id}-confirmed`,
          }
        }
      });
      dispatch({ type: 'SET_CURRENT_TX', payload: { status: 'confirmed', id } });
    } else {
      dispatch({ type: 'UPDATE_TX', payload: { id, updates: { status: 'failed' } } });
      dispatch({ type: 'SET_CURRENT_TX', payload: { status: 'failed', id, error: 'Simulated failure' } });
    }
  }, [dispatch]);

  const resetCurrent = useCallback(() => {
    dispatch({ type: 'RESET_CURRENT_TX' });
  }, [dispatch]);

  return { simulate, resetCurrent };
}
