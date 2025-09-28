import { useCallback } from 'react';
import { useTransactionContext, useAppContext } from '../contexts';
import { useNotify } from './useNotify';
import { chainConfig } from '../onchain/env';
import { stakeHempOnChain } from '../onchain/staking';

// Placeholder wallet signer integration point; to be replaced when wallet hook is wired
type SignerFn = (txns: any[]) => Promise<Uint8Array[]>;
const mockSigner: SignerFn = async (txns) => {
  // In real integration, use wallet-provided signer returning signed blobs
  // For now, just throw to indicate missing signer if actually invoked
  throw new Error('Wallet signer not integrated yet');
};

// Unified simulated contract interaction layer (placeholder for real Algorand logic)
export function useAppTransactions() {
  const { dispatch: txDispatch } = useTransactionContext();
  const { dispatch: appDispatch } = useAppContext();
  const { notify } = useNotify();

  const beginTx = (type: string, note?: string) => {
    const id = `${type}-${Date.now()}`;
    txDispatch({ type: 'SET_CURRENT_TX', payload: { status: 'pending', id } });
    txDispatch({ type: 'ADD_TX', payload: { id, type, status: 'pending', note } });
    return id;
  };

  const finalize = (id: string, success: boolean, error?: string) => {
    txDispatch({ type: 'UPDATE_TX', payload: { id, updates: { status: success ? 'confirmed' : 'failed', note: error } } });
    txDispatch({ type: 'SET_CURRENT_TX', payload: success ? { status: 'confirmed', id } : { status: 'failed', id, error } });
  };

  const simulateDelay = () => new Promise(r => setTimeout(r, 900 + Math.random()*600));

  const purchaseAlgo = useCallback(async (amountAlgo: number) => {
    const id = beginTx('purchase_algo', `Spend ${amountAlgo} ALGO`);
    await simulateDelay();
    const success = Math.random() > 0.05;
    if (success) {
      appDispatch({ type: 'PURCHASE_WITH_ALGO', payload: { amountAlgo } });
      finalize(id, true);
      notify('Purchase (ALGO) confirmed', 'success');
    } else finalize(id, false, 'Network error');
  }, [appDispatch]);

  const purchaseUsdc = useCallback(async (amountUsdc: number) => {
    const id = beginTx('purchase_usdc', `Spend ${amountUsdc} USDC`);
    await simulateDelay();
    const success = Math.random() > 0.05;
    if (success) {
      appDispatch({ type: 'PURCHASE_WITH_USDC', payload: { amountUsdc } });
      finalize(id, true);
      notify('Purchase (USDC) confirmed', 'success');
    } else finalize(id, false, 'Slippage too high');
  }, [appDispatch]);

  const claimWithHemp = useCallback(async (hempSpent: number) => {
    const id = beginTx('claim_hemp', `Spend ${hempSpent} HEMP`);
    await simulateDelay();
    const success = Math.random() > 0.05;
    if (success) {
      appDispatch({ type: 'CLAIM_WITH_HEMP', payload: { hempSpent } });
      finalize(id, true);
      notify('HEMP Claim confirmed', 'success');
    } else finalize(id, false, 'Claim window closed');
  }, [appDispatch]);

  const creditSpinHemp = useCallback(async (hempWon: number) => {
    const id = beginTx('spin_reward', `Credit ${hempWon} HEMP`);
    await simulateDelay();
    appDispatch({ type: 'CREDIT_SPIN_HEMP', payload: { hempWon } });
    finalize(id, true);
    notify('Spin HEMP credited', 'info');
  }, [appDispatch]);

  const stakeHemp = useCallback(async (amount: number) => {
    const id = beginTx('stake_hemp', `Stake ${amount} HEMP`);
    try {
      if (chainConfig.mode === 'onchain') {
        // On-chain path
        // TODO: replace mock account and signer retrieval with real wallet integration
        const activeAccount = 'WALLET_ADDRESS_PLACEHOLDER';
        await stakeHempOnChain(activeAccount, mockSigner, amount);
        appDispatch({ type: 'STAKE_HEMP', payload: { amount } });
        finalize(id, true);
        notify('On-chain stake confirmed', 'success');
      } else {
        // Simulation path
        await simulateDelay();
        appDispatch({ type: 'STAKE_HEMP', payload: { amount } });
        finalize(id, true);
        notify('Stake confirmed (simulation)', 'success');
      }
    } catch (e: any) {
      finalize(id, false, e.message || 'Stake failed');
      notify('Stake failed: ' + (e.message || 'error'), 'error');
    }
  }, [appDispatch]);

  const voteProposal = useCallback(async (idNum: number, weedSpent: number, title?: string) => {
    const id = beginTx('vote', `Vote ${idNum}`);
    await simulateDelay();
    const success = Math.random() > 0.02;
    if (success) {
      appDispatch({ type: 'VOTE_PROPOSAL', payload: { id: idNum, weedSpent } });
      finalize(id, true);
      notify(`Vote recorded${title ? ': ' + title : ''}`, 'success');
    } else finalize(id, false, 'Vote failed');
  }, [appDispatch]);

  return { purchaseAlgo, purchaseUsdc, claimWithHemp, creditSpinHemp, stakeHemp, voteProposal, mode: chainConfig.mode };
}
