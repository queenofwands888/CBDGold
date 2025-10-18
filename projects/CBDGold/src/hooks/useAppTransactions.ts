import { useCallback } from 'react';
import type { TransactionSigner } from 'algosdk';
import { useTransactionContext, useAppContext } from '../contexts';
import { useNotify } from './useNotify';
import { chainConfig } from '../onchain/env';
import { stakeHempOnChain, unstakeHempOnChain, claimStakingRewardsOnChain } from '../onchain/stakingTransactions';
import { voteOnChain } from '../onchain/governanceTransactions';
import { claimPrizeOnChain } from '../onchain/prizeTransactions';
import { useWalletManager } from './useWalletManager';

// Unified simulated contract interaction layer (placeholder for real Algorand logic)
export function useAppTransactions() {
  const { dispatch: txDispatch } = useTransactionContext();
  const { dispatch: appDispatch, state: appState } = useAppContext();
  const wallet = useWalletManager();
  const { notify } = useNotify();

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const beginTx = useCallback((type: string, note?: string) => {
    const id = `${type}-${Date.now()}`;
    txDispatch({ type: 'SET_CURRENT_TX', payload: { status: 'pending', id } });
    txDispatch({ type: 'ADD_TX', payload: { id, type, status: 'pending', note } });
    return id;
  }, [txDispatch]);

  const finalize = useCallback((id: string, success: boolean, error?: string) => {
    txDispatch({ type: 'UPDATE_TX', payload: { id, updates: { status: success ? 'confirmed' : 'failed', note: error } } });
    txDispatch({ type: 'SET_CURRENT_TX', payload: success ? { status: 'confirmed', id } : { status: 'failed', id, error } });
  }, [txDispatch]);

  const simulateDelay = () => new Promise(r => setTimeout(r, 900 + Math.random() * 600));

  const purchaseAlgo = useCallback(async (amountAlgo: number) => {
    const id = beginTx('purchase_algo', `Spend ${amountAlgo} ALGO`);
    await simulateDelay();
    const success = Math.random() > 0.05;
    if (success) {
      appDispatch({ type: 'PURCHASE_WITH_ALGO', payload: { amountAlgo } });
      finalize(id, true);
      notify('Purchase (ALGO) confirmed', 'success');
    } else finalize(id, false, 'Network error');
  }, [appDispatch, beginTx, finalize, notify]);

  const purchaseUsdc = useCallback(async (amountUsdc: number) => {
    const id = beginTx('purchase_usdc', `Spend ${amountUsdc} USDC`);
    await simulateDelay();
    const success = Math.random() > 0.05;
    if (success) {
      appDispatch({ type: 'PURCHASE_WITH_USDC', payload: { amountUsdc } });
      finalize(id, true);
      notify('Purchase (USDC) confirmed', 'success');
    } else finalize(id, false, 'Slippage too high');
  }, [appDispatch, beginTx, finalize, notify]);

  const claimWithHemp = useCallback(async (hempSpent: number) => {
    const id = beginTx('claim_hemp', `Spend ${hempSpent} HEMP`);
    await simulateDelay();
    const success = Math.random() > 0.05;
    if (success) {
      appDispatch({ type: 'CLAIM_WITH_HEMP', payload: { hempSpent } });
      finalize(id, true);
      notify('HEMP Claim confirmed', 'success');
    } else finalize(id, false, 'Claim window closed');
  }, [appDispatch, beginTx, finalize, notify]);

  const creditSpinHemp = useCallback(async (hempWon: number) => {
    const id = beginTx('spin_reward', `Credit ${hempWon} HEMP`);
    await simulateDelay();
    appDispatch({ type: 'CREDIT_SPIN_HEMP', payload: { hempWon } });
    finalize(id, true);
    notify('Spin HEMP credited', 'info');
  }, [appDispatch, beginTx, finalize, notify]);

  const stakeHemp = useCallback(async (amount: number) => {
    const id = beginTx('stake_hemp', `Stake ${amount} HEMP`);
    try {
      if (chainConfig.mode === 'onchain') {
        const activeAccount = appState.walletAddress;
        if (!activeAccount) throw new Error('Wallet not connected');
        const signer: TransactionSigner = async (txns) => wallet.signTransactions(txns);
        const { txId } = await stakeHempOnChain(activeAccount, signer, amount);
        appDispatch({ type: 'STAKE_HEMP', payload: { amount } });
        finalize(id, true);
        notify(`On-chain stake confirmed (tx ${txId.slice(0, 8)}…)`, 'success');
      } else {
        // Simulation path
        await simulateDelay();
        appDispatch({ type: 'STAKE_HEMP', payload: { amount } });
        finalize(id, true);
        notify('Stake confirmed (simulation)', 'success');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unknown error');
      finalize(id, false, message);
      notify(`Stake failed: ${message}`, 'error');
    }
  }, [appDispatch, appState.walletAddress, wallet, notify, beginTx, finalize]);

  const unstakeHemp = useCallback(async (amount: number) => {
    const id = beginTx('unstake_hemp', `Unstake ${amount} HEMP`);
    try {
      if (chainConfig.mode === 'onchain') {
        const activeAccount = appState.walletAddress;
        if (!activeAccount) throw new Error('Wallet not connected');
        const signer: TransactionSigner = async (txns) => wallet.signTransactions(txns);
        const { txId } = await unstakeHempOnChain(activeAccount, signer, amount);
        appDispatch({ type: 'UNSTAKE_HEMP', payload: { amount } });
        finalize(id, true);
        notify(`On-chain unstake confirmed (tx ${txId.slice(0, 8)}…)`, 'success');
      } else {
        await simulateDelay();
        appDispatch({ type: 'UNSTAKE_HEMP', payload: { amount } });
        finalize(id, true);
        notify('Unstake confirmed (simulation)', 'success');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unknown error');
      finalize(id, false, message);
      notify(`Unstake failed: ${message}`, 'error');
    }
  }, [appDispatch, appState.walletAddress, wallet, notify, beginTx, finalize]);

  const claimStakingRewards = useCallback(async (rewardAmount: number) => {
    const id = beginTx('claim_rewards', `Claim ~${rewardAmount} HEMP`);
    try {
      if (chainConfig.mode === 'onchain') {
        const activeAccount = appState.walletAddress;
        if (!activeAccount) throw new Error('Wallet not connected');
        const signer: TransactionSigner = async (txns) => wallet.signTransactions(txns);
        const { txId } = await claimStakingRewardsOnChain(activeAccount, signer);
        appDispatch({ type: 'CLAIM_STAKING_REWARDS', payload: { reward: rewardAmount } });
        finalize(id, true);
        notify(`On-chain rewards claimed (tx ${txId.slice(0, 8)}…)`, 'success');
      } else {
        await simulateDelay();
        appDispatch({ type: 'CLAIM_STAKING_REWARDS', payload: { reward: rewardAmount } });
        finalize(id, true);
        notify('Rewards claimed (simulation)', 'success');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unknown error');
      finalize(id, false, message);
      notify(`Claim failed: ${message}`, 'error');
    }
  }, [appDispatch, appState.walletAddress, wallet, notify, beginTx, finalize]);

  const voteProposal = useCallback(async (idNum: number, weedSpent: number, title?: string) => {
    const id = beginTx('vote', `Vote ${idNum}`);
    try {
      if (chainConfig.mode === 'onchain') {
        const activeAccount = appState.walletAddress;
        if (!activeAccount) throw new Error('Wallet not connected');
        const signer: TransactionSigner = async (txns) => wallet.signTransactions(txns);
        const { txId } = await voteOnChain(activeAccount, signer, idNum, true);
        appDispatch({ type: 'VOTE_PROPOSAL', payload: { id: idNum, weedSpent } });
        finalize(id, true);
        notify(`Vote submitted${title ? ': ' + title : ''} (tx ${txId.slice(0, 8)}…)`, 'success');
      } else {
        await simulateDelay();
        appDispatch({ type: 'VOTE_PROPOSAL', payload: { id: idNum, weedSpent } });
        finalize(id, true);
        notify(`Vote recorded${title ? ': ' + title : ''}`, 'success');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unknown error');
      finalize(id, false, message);
      notify(`Vote failed: ${message}`, 'error');
    }
  }, [appDispatch, appState.walletAddress, wallet, notify, beginTx, finalize]);

  const claimPrize = useCallback(async () => {
    const id = beginTx('claim_prize', 'Claim spin prize');
    try {
      if (!appState.hasPrizeToClaim) {
        throw new Error('No prize is currently available to claim');
      }

      if (chainConfig.mode === 'onchain') {
        const activeAccount = appState.walletAddress;
        if (!activeAccount) throw new Error('Wallet not connected');
        const signer: TransactionSigner = async (txns) => wallet.signTransactions(txns);
        const prizeAmount = 250_000; // placeholder reward amount until contract returns value
        const { txId } = await claimPrizeOnChain(activeAccount, signer, prizeAmount);
        appDispatch({ type: 'CREDIT_SPIN_HEMP', payload: { hempWon: prizeAmount } });
        appDispatch({ type: 'SET_PRIZE_CLAIM_STATUS', payload: false });
        finalize(id, true);
        notify(`Prize claimed on-chain (tx ${txId.slice(0, 8)}…)`, 'success');
      } else {
        await simulateDelay();
        const hempReward = 250_000;
        appDispatch({ type: 'CREDIT_SPIN_HEMP', payload: { hempWon: hempReward } });
        appDispatch({ type: 'SET_PRIZE_CLAIM_STATUS', payload: false });
        finalize(id, true);
        notify(`Prize claim confirmed! Credited ${hempReward.toLocaleString()} HEMP`, 'success');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unknown error');
      finalize(id, false, message);
      notify(`Prize claim failed: ${message}`, 'error');
      throw error instanceof Error ? error : new Error(message);
    }
  }, [appDispatch, appState.hasPrizeToClaim, appState.walletAddress, wallet, notify, beginTx, finalize]);

  return { purchaseAlgo, purchaseUsdc, claimWithHemp, creditSpinHemp, stakeHemp, unstakeHemp, claimStakingRewards, voteProposal, claimPrize, mode: chainConfig.mode };
}
