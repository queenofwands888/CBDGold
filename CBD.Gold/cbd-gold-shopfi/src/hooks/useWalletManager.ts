import { useWallet } from '@txnlab/use-wallet-react';
import { useAppContext } from '../contexts';
import { useCallback } from 'react';
// import { fetchAsaBalances } from '../onchain/assets';
// import { chainConfig } from '../onchain/env';

export function useWalletManager() {
  const { state, dispatch } = useAppContext();
  const wallet = useWallet();

  const refreshAssets = useCallback(async () => {
    if (!wallet.activeAddress) return;
    // TODO: Add asset refresh logic here if needed
  }, [wallet]);

  const connect = useCallback(async () => {
    if (!wallet.isReady || !wallet.activeWallet || !wallet.activeAddress) return;
    dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: wallet.activeAddress } });
    refreshAssets();
  }, [wallet, dispatch, refreshAssets]);

  const disconnect = useCallback(() => {
    dispatch({ type: 'RESET_WALLET' });
  }, [dispatch]);

  return {
    connect,
    disconnect,
    refreshAssets: () => refreshAssets(),
  async signTransactions(txns: import('algosdk').Transaction[]) {
      if (wallet.activeWallet && wallet.activeAddress) {
        try {
          if (wallet.transactionSigner) {
            const result = await wallet.transactionSigner(txns, [0]);
            return result;
          }
        } catch {
          throw new Error('Transaction signing failed');
        }
      }
      throw new Error('No wallet signer available');
    },
    connected: !!wallet.activeWallet,
    address: wallet.activeAddress,
    assets: state.accountAssets,
    connecting: false
  };
}