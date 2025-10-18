import { useEffect } from 'react';
import { chainConfig } from '../onchain/env';
import { fetchStakingLocalState } from '../onchain/stakingTransactions';
import { useAppContext } from '../contexts';
import { fetchAsaBalances } from '../onchain/assetBalances';

// Polling sync for on-chain mode; lightweight (no websocket)
export function useOnChainSync(intervalMs = 20000) {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    if (chainConfig.mode !== 'onchain' || !state.walletConnected) return;
    let cancelled = false;

    const run = async () => {
      try {
        const [localState, balances] = await Promise.all([
          fetchStakingLocalState(state.walletAddress),
          fetchAsaBalances(state.walletAddress)
        ]);
        if (cancelled) return;
        if (balances) {
          dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: balances });
        }
        if (localState) {
          // Update stakedAmount from chain authoritative value
          dispatch({ type: 'SET_STAKED_AMOUNT', payload: localState.staked });
        }
      } catch (error) {
        // swallow errors to avoid spamming UI
        console.warn('On-chain sync error', error);
      }
    };
    run();
    const id = setInterval(run, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [state.walletConnected, state.walletAddress, dispatch, intervalMs]);
}
