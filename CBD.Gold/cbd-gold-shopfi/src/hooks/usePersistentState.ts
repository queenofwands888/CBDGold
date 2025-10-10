import { useEffect } from 'react';
import { useAppContext } from '../contexts';

// Persists selected slices of global app state to localStorage and hydrates on mount.
export const usePersistentState = () => {
  const { state, dispatch } = useAppContext();
  // Hydrate once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cbdgold_app_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.accountAssets) dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: parsed.accountAssets });
        if (typeof parsed.stakedAmount === 'number') dispatch({ type: 'SET_STAKED_AMOUNT', payload: parsed.stakedAmount });
        if (Array.isArray(parsed.governance?.proposals)) dispatch({ type: 'SET_GOVERNANCE_PROPOSALS', payload: parsed.governance.proposals });
        if (parsed.walletConnected && parsed.walletAddress) {
          dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: parsed.walletAddress } });
        }
        if (typeof parsed.spinBonusDiscount === 'number' && parsed.spinBonusDiscount > 0 && parsed.lastSpinResult) {
          dispatch({ type: 'SET_SPIN_BONUS', payload: { discount: parsed.spinBonusDiscount, result: parsed.lastSpinResult } });
          if (parsed.spinBonusExpiresAt && Date.now() > parsed.spinBonusExpiresAt) {
            dispatch({ type: 'CLEAR_SPIN_BONUS' });
          }
        }
      }
    } catch (e) {
      console.warn('Persistence hydration failed', e);
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
    try { localStorage.setItem('cbdgold_app_state', JSON.stringify(subset)); } catch {}
  }, [state.walletConnected, state.walletAddress, state.accountAssets, state.stakedAmount, state.governance.proposals, state.spinBonusDiscount, state.lastSpinResult, state.spinBonusExpiresAt]);
};
