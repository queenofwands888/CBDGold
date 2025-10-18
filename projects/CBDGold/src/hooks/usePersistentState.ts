import { useEffect } from 'react';
import { useAppContext } from '../contexts';
import { secureStorage } from '../utils/storage';
import { logger } from '../utils/logger';
import type { AccountAssets } from '../types';

interface StoredGovernanceProposal {
  id: number;
  title: string;
  description: string;
  status: string;
  timeLeft: string;
  weedRequired: number;
  votes?: number;
}

interface StoredAppState {
  accountAssets?: Partial<AccountAssets>;
  stakedAmount?: number;
  governance?: { proposals?: StoredGovernanceProposal[] };
  walletConnected?: boolean;
  walletAddress?: string;
  spinBonusDiscount?: number;
  lastSpinResult?: string;
  spinBonusExpiresAt?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isAccountAssets = (value: unknown): value is AccountAssets => (
  isRecord(value) &&
  typeof value.algo === 'number' &&
  typeof value.hemp === 'number' &&
  typeof value.weed === 'number' &&
  typeof value.usdc === 'number'
);

const isGovernanceProposals = (value: unknown): value is StoredGovernanceProposal[] => (
  Array.isArray(value) && value.every(item => (
    isRecord(item) &&
    typeof item.id === 'number' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.status === 'string' &&
    typeof item.timeLeft === 'string' &&
    typeof item.weedRequired === 'number'
  ))
);

// Persists selected slices of global app state via secureStorage and hydrates on mount.
export const usePersistentState = () => {
  const { state, dispatch } = useAppContext();
  // Hydrate once
  useEffect(() => {
    const raw = secureStorage.getJSON<unknown>('app_state');
    if (!isRecord(raw)) return;
    const stored = raw as StoredAppState;

    try {
      if (stored.accountAssets && isAccountAssets(stored.accountAssets)) {
        dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: stored.accountAssets });
      }
      if (typeof stored.stakedAmount === 'number') {
        dispatch({ type: 'SET_STAKED_AMOUNT', payload: stored.stakedAmount });
      }
      if (stored.governance?.proposals && isGovernanceProposals(stored.governance.proposals)) {
        dispatch({ type: 'SET_GOVERNANCE_PROPOSALS', payload: stored.governance.proposals });
      }
      if (stored.walletConnected && typeof stored.walletAddress === 'string') {
        dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: stored.walletAddress } });
      }
      if (typeof stored.spinBonusDiscount === 'number' && stored.spinBonusDiscount > 0 && typeof stored.lastSpinResult === 'string') {
        dispatch({ type: 'SET_SPIN_BONUS', payload: { discount: stored.spinBonusDiscount, result: stored.lastSpinResult } });
        if (stored.spinBonusExpiresAt && Date.now() > stored.spinBonusExpiresAt) {
          dispatch({ type: 'CLEAR_SPIN_BONUS' });
        }
      }
    } catch (error) {
      logger.warn('Persistence hydration failed', error);
    }
  }, [dispatch]);

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
