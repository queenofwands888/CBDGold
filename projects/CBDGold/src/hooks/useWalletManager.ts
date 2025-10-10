import { MutableRefObject, useCallback, useMemo, useRef } from 'react';
import algosdk from 'algosdk';
import { useAppContext } from '../contexts';
import { chainConfig } from '../onchain/env';
import { fetchAsaBalances } from '../onchain/assets';
import { AccountAssets } from '../types';

type WalletConnection = {
  address: string;
  assets: AccountAssets;
};

type WalletAdapter = {
  name: string;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  refreshAssets(address: string): Promise<AccountAssets>;
  signTransactions(txns: algosdk.Transaction[]): Promise<Uint8Array[]>;
};

const SIMULATION_DELAY_MS = 600;
const SIMULATED_PREFIX = 'FAKE';

const createSimulatedAddress = () => `${SIMULATED_PREFIX}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const createSimulatedBalances = (): AccountAssets => ({
  algo: parseFloat((0.5 + Math.random() * 10).toFixed(3)),
  hemp: Math.floor(Math.random() * 50000),
  weed: Math.floor(Math.random() * 8000),
  usdc: parseFloat((Math.random() * 250).toFixed(2))
});

const decodeSignedBlob = (blob: string | Uint8Array): Uint8Array => {
  if (typeof blob !== 'string') {
    return new Uint8Array(blob);
  }

  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(blob, 'base64'));
  }

  if (typeof atob === 'function') {
    const binary = atob(blob);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }

  throw new Error('Unable to decode signed transaction blob');
};

function createSimulationAdapter(): WalletAdapter {
  return {
    name: 'simulation-adapter',
    async connect() {
      await new Promise((resolve) => setTimeout(resolve, SIMULATION_DELAY_MS));
      const address = createSimulatedAddress();
      return { address, assets: createSimulatedBalances() };
    },
    async disconnect() {
      return Promise.resolve();
    },
    async refreshAssets(_address: string) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return createSimulatedBalances();
    },
    async signTransactions() {
      throw new Error('Simulation wallet cannot sign real transactions.');
    }
  };
}

function getWindowProvider(): any | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as any).algorand || (window as any).myAlgoConnect || undefined;
}

function createOnChainAdapter(simulationAdapter: WalletAdapter, hasWarnedNoProvider: MutableRefObject<boolean>): WalletAdapter {
  return {
    name: 'onchain-adapter',
    async connect() {
      const provider = getWindowProvider();
      if (!provider) {
        if (!hasWarnedNoProvider.current) {
          console.warn('Algorand wallet provider not detected; falling back to simulation mode');
          hasWarnedNoProvider.current = true;
        }
        return simulationAdapter.connect();
      }

      const response = await provider.connect?.();
      const address = Array.isArray(response) && response.length > 0
        ? response[0]
        : provider.accounts?.[0]?.address;

      if (!address) {
        throw new Error('Wallet provider did not return an address');
      }

      try {
        const balances = await fetchAsaBalances(address);
        return { address, assets: balances };
      } catch (error) {
        console.warn('Unable to fetch on-chain balances, falling back to simulation values', error);
  return { address, assets: await simulationAdapter.refreshAssets(address) };
      }
    },
    async disconnect() {
      const provider = getWindowProvider();
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    },
    async refreshAssets(address: string) {
      try {
        return await fetchAsaBalances(address);
      } catch (error) {
        console.warn('Failed to fetch ASA balances, returning simulated values', error);
  return simulationAdapter.refreshAssets(address);
      }
    },
    async signTransactions(txns: algosdk.Transaction[]) {
      const provider = getWindowProvider();
      if (!provider?.signTxns && !provider?.signTransactions) {
        throw new Error('Connected wallet does not expose a transaction signer.');
      }

      const encodedTxns = txns.map((txn) => txn.toByte());
      const signer = provider.signTxns ?? provider.signTransactions;
      const signed = await signer.call(provider, encodedTxns);
      return signed.map(decodeSignedBlob);
    }
  };
}

export function useWalletManager() {
  const { state, dispatch } = useAppContext();
  const hasWarnedNoProvider = useRef(false);

  const simulationAdapter = useMemo(() => createSimulationAdapter(), []);
  const onChainAdapter = useMemo(() => createOnChainAdapter(simulationAdapter, hasWarnedNoProvider), [simulationAdapter]);
  const adapter = chainConfig.mode === 'onchain' ? onChainAdapter : simulationAdapter;

  const connect = useCallback(async () => {
    if (state.walletConnected || state.isConnecting) return;
    dispatch({ type: 'SET_CONNECTING', payload: true });

    try {
      const { address, assets } = await adapter.connect();
      dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address } });
      dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: assets });
    } catch (error) {
      console.error(`[wallet:${adapter.name}] connect failed`, error);
      dispatch({ type: 'SET_CONNECTING', payload: false });
      throw error;
    }
  }, [adapter, dispatch, state.isConnecting, state.walletConnected]);

  const disconnect = useCallback(() => {
    dispatch({ type: 'RESET_WALLET' });
    adapter.disconnect().catch((error) => {
      console.warn(`[wallet:${adapter.name}] disconnect failed`, error);
    });
  }, [adapter, dispatch]);

  const refreshAssets = useCallback(async () => {
    const address = state.walletAddress;
    if (!address) return;
    try {
      const balances = await adapter.refreshAssets(address);
      dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: balances });
    } catch (error) {
      console.warn(`[wallet:${adapter.name}] asset refresh failed`, error);
    }
  }, [adapter, dispatch, state.walletAddress]);

  const signTransactions = useCallback(async (txns: algosdk.Transaction[]) => {
    return adapter.signTransactions(txns);
  }, [adapter]);

  return {
    connect,
    disconnect,
    refreshAssets,
    signTransactions,
    connected: state.walletConnected,
    address: state.walletAddress,
    assets: state.accountAssets,
    connecting: state.isConnecting,
    mode: chainConfig.mode,
  };
}
