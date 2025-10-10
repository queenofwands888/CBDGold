import { useCallback } from 'react';
import { useAppContext } from '../contexts';
import algosdk from 'algosdk';
import { chainConfig } from '../onchain/env';
import { fetchAsaBalances } from '../onchain/assets';

// Lightweight simulated wallet manager until a production wallet integration (Pera, AlgoSigner, etc.) is wired.
export function useWalletManager() {
  const { state, dispatch } = useAppContext();

  const connect = useCallback(async () => {
    if (state.walletConnected || state.isConnecting) return;
    dispatch({ type: 'SET_CONNECTING', payload: true });
    try {
      // Simulated wallet flow until production integration is enabled
      await new Promise(r => setTimeout(r, 600));
      const fakeAddress = 'FAKE' + Math.random().toString(36).slice(2, 10).toUpperCase();
      dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: fakeAddress } });
      refreshAssets(fakeAddress);
    } catch (e) {
      console.error('Wallet connect failed', e);
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  }, [state.walletConnected, state.isConnecting, dispatch]);

  const disconnect = useCallback(() => {
    dispatch({ type: 'RESET_WALLET' });
  }, [dispatch]);

  const refreshAssets = useCallback(async (addr?: string) => {
    const address = addr || state.walletAddress;
    if (!address) return;
    try {
      if (chainConfig.mode === 'onchain') {
        const balances = await fetchAsaBalances(address);
        dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: balances });
      } else {
        // simulation fallback
        dispatch({
          type: 'SET_ACCOUNT_ASSETS',
          payload: {
            algo: parseFloat((0.5 + Math.random() * 10).toFixed(3)),
            hemp: Math.floor(Math.random() * 50000),
            weed: Math.floor(Math.random() * 8000),
            usdc: parseFloat((Math.random() * 250).toFixed(2))
          }
        });
      }
    } catch (e) {
      console.warn('Asset refresh failed', e);
    }
  }, [state.walletConnected, state.walletAddress, dispatch]);

  return {
    connect,
    disconnect,
    refreshAssets: () => refreshAssets(),
    async signTransactions(_: algosdk.Transaction[]) {
      throw new Error('No wallet signer available: interactive wallet integration is disabled.');
    },
    connected: state.walletConnected,
    address: state.walletAddress,
    assets: state.accountAssets,
    connecting: state.isConnecting
  };
}
