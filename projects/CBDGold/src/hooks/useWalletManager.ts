import { useCallback, useRef } from 'react';
import { useAppContext } from '../contexts';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import { chainConfig } from '../onchain/env';
import { fetchAsaBalances } from '../onchain/assets';

// Very lightweight simulated wallet manager until real integration (Pera, AlgoSigner, etc.) is wired.
// Provides connect/disconnect and fake asset refresh.
export function useWalletManager() {
  const { state, dispatch } = useAppContext();
  const peraRef = useRef<PeraWalletConnect | null>(null);

  // Lazy init Pera instance
  if (!peraRef.current && typeof window !== 'undefined') {
    peraRef.current = new PeraWalletConnect({ chainId: chainConfig.network === 'testnet' ? 416001 : undefined });
  }

  const connect = useCallback(async () => {
    if (state.walletConnected || state.isConnecting) return;
    dispatch({ type: 'SET_CONNECTING', payload: true });
    try {
      // Prefer Pera wallet if available
      if (peraRef.current) {
        const accounts = await peraRef.current.connect();
        const addr = accounts[0];
        dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: addr } });
        refreshAssets(addr);
        return;
      }
      // Fallback simulation
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
    try { peraRef.current?.disconnect(); } catch { /* ignore */ }
    dispatch({ type: 'RESET_WALLET' });
  }, [dispatch]);

  const refreshAssets = useCallback(async (addr?: string) => {
    if (!state.walletConnected) return;
    const address = addr || state.walletAddress;
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
    connected: state.walletConnected,
    address: state.walletAddress,
    assets: state.accountAssets,
    connecting: state.isConnecting
  };
}
