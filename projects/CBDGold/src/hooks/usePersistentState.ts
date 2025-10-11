import { useEffect } from 'react';
import { useAppContext } from '../contexts';
import { secureStorage } from '../utils/storage';
import { logger } from '../utils/logger';

// Persists selected slices of global app state via secureStorage and hydrates on mount.
export const usePersistentState = () => {
  const { state, dispatch } = useAppContext();
  // Hydrate once
  useEffect(() => {
    const stored = secureStorage.getJSON<any>('app_state');
    if (!stored) return;

    try {
      if (stored.accountAssets && typeof stored.accountAssets === 'object') {
        dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: stored.accountAssets });
      }
      if (typeof stored.stakedAmount === 'number') {
        dispatch({ type: 'SET_STAKED_AMOUNT', payload: stored.stakedAmount });
      }
      if (Array.isArray(stored.governance?.proposals)) {
        dispatch({ type: 'SET_GOVERNANCE_PROPOSALS', payload: stored.governance.proposals });
      }
      if (stored.walletConnected && typeof stored.walletAddress === 'string') {
        dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: stored.walletAddress } });
      }
      if (typeof stored.spinBonusDiscount === 'number' && stored.spinBonusDiscount > 0 && stored.lastSpinResult) {
        dispatch({ type: 'SET_SPIN_BONUS', payload: { discount: stored.spinBonusDiscount, result: stored.lastSpinResult } });
        if (stored.spinBonusExpiresAt && Date.now() > stored.spinBonusExpiresAt) {
          dispatch({ type: 'CLEAR_SPIN_BONUS' });
        }
      }
    } catch (error) {
      logger.warn('Persistence hydration failed', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever relevant slices change
  useEffect(() => {
    const subset = {
      walletConnected: state.walletConnected,
      walletAddress: state.walletAddress,
      accountAssets: state.accountAssets,
      stakedAmount: state.stakedAmount,
      governance: { proposals: state.governance.proposals },
      spinBonusDiscount: state.spinBonusDiscount,
      lastSpinResult: state.lastSpinResult,
      spinBonusExpiresAt: state.spinBonusExpiresAt
    };
    const persisted = secureStorage.setJSON('app_state', subset, { maxBytes: 24_576 });
    if (!persisted) {
      logger.warn('Failed to persist app_state, payload too large or storage unavailable');
    }
  }, [state.walletConnected, state.walletAddress, state.accountAssets, state.stakedAmount, state.governance.proposals, state.spinBonusDiscount, state.lastSpinResult, state.spinBonusExpiresAt]);
};
