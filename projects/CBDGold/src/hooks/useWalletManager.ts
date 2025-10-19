import { MutableRefObject, useCallback, useMemo, useRef, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import type { Wallet as UseWallet } from '@txnlab/use-wallet-react';
import { WalletId, type SignTxnsResponse } from '@txnlab/use-wallet';
import algosdk from 'algosdk';
import { useAppContext } from '../contexts';
import { chainConfig } from '../onchain/env';
import { fetchAsaBalances } from '../onchain/assetBalances';
import { AccountAssets } from '../types';
import { logger } from '../utils/logger';

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
const isTestEnvironment = typeof globalThis !== 'undefined' && Boolean((globalThis as { __TESTING__?: boolean }).__TESTING__);

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

const normalizeSignedValue = (value: string | Uint8Array | number[] | null | undefined): Uint8Array => {
  if (!value) {
    throw new Error('Wallet returned an empty signature');
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  if (Array.isArray(value)) {
    return Uint8Array.from(value);
  }
  return decodeSignedBlob(value);
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
    async refreshAssets(address: string) {
      void address;
      await new Promise((resolve) => setTimeout(resolve, 150));
      return createSimulatedBalances();
    },
    async signTransactions() {
      throw new Error('Simulation wallet cannot sign real transactions.');
    }
  };
}

type WindowWalletAccount = { address: string };
type WindowWalletProvider = {
  connect?: () => Promise<string[] | WindowWalletAccount[] | { accounts?: WindowWalletAccount[] } | undefined>;
  accounts?: WindowWalletAccount[];
  disconnect?: () => Promise<void>;
  signTxns?: (this: WindowWalletProvider, txns: Uint8Array[]) => Promise<SignTxnsResponse>;
  signTransactions?: (this: WindowWalletProvider, txns: Uint8Array[]) => Promise<SignTxnsResponse>;
};

function getWindowProvider(): WindowWalletProvider | undefined {
  if (typeof window === 'undefined') return undefined;
  const candidates = window as typeof window & {
    algorand?: WindowWalletProvider;
    myAlgoConnect?: WindowWalletProvider;
  };
  return candidates.algorand ?? candidates.myAlgoConnect;
}

function createOnChainAdapter(simulationAdapter: WalletAdapter, hasWarnedNoProvider: MutableRefObject<boolean>): WalletAdapter {
  return {
    name: 'onchain-adapter',
    async connect() {
      const provider = getWindowProvider();
      if (!provider) {
        if (!hasWarnedNoProvider.current) {
          logger.warn('Algorand wallet provider not detected; falling back to simulation mode');
          hasWarnedNoProvider.current = true;
        }
        return simulationAdapter.connect();
      }

      const response = await provider.connect?.();
      let address: string | undefined;
      if (Array.isArray(response) && response.length > 0) {
        const first = response[0] as string | WindowWalletAccount;
        address = typeof first === 'string' ? first : first?.address;
      }

      if (!address && response && typeof response === 'object' && 'accounts' in response) {
        const accounts = (response as { accounts?: WindowWalletAccount[] }).accounts;
        address = accounts?.[0]?.address;
      }

      if (!address && provider.accounts?.length) {
        address = provider.accounts[0].address;
      }

      if (!address) {
        throw new Error('Wallet provider did not return an address');
      }

      try {
        const balances = await fetchAsaBalances(address);
        return { address, assets: balances };
      } catch (error) {
        logger.warn('Unable to fetch on-chain balances, falling back to simulation values', error);
        const fallbackAssets = await simulationAdapter.refreshAssets(address);
        return { address, assets: fallbackAssets };
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
        logger.warn('Failed to fetch ASA balances, returning simulated values', error);
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
      if (!signer) {
        throw new Error('Connected wallet does not expose a transaction signer.');
      }
      const boundSigner = signer.bind(provider);
      const signed = await boundSigner(encodedTxns);
      return signed.map(normalizeSignedValue);
    }
  };
}

export function useWalletManager() {
  const { state, dispatch } = useAppContext();
  const hasWarnedNoProvider = useRef(false);
  const uw = useWallet();

  const simulationAdapter = useMemo(() => createSimulationAdapter(), []);
  const onChainAdapter = useMemo(() => createOnChainAdapter(simulationAdapter, hasWarnedNoProvider), [simulationAdapter]);
  const adapter = chainConfig.mode === 'onchain' ? onChainAdapter : simulationAdapter;

  const connect = useCallback(async (preferredWalletId?: WalletId) => {
    if (state.walletConnected || state.isConnecting) return;
    dispatch({ type: 'SET_CONNECTING', payload: true });

    try {
      if (!isTestEnvironment && uw?.wallets?.length) {
        const targetId = preferredWalletId ?? WalletId.PERA;
        const wallets = uw.wallets as UseWallet[];
        const target = wallets.find((wallet) => wallet.id === targetId) ?? wallets[0];

        if (target) {
          try {
            const connectedAccounts = await target.connect();
            target.setActive();
            const active = uw.activeAddress
              || target.activeAccount?.address
              || target.accounts[0]?.address
              || connectedAccounts?.[0]?.address;

            if (active) {
              const assets = await adapter.refreshAssets(active);
              dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: active } });
              dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: assets });
              return;
            }

            logger.warn('[wallet] provider did not supply an address; falling back to simulation');
          } catch (walletError) {
            logger.warn('[wallet] provider connect failed; falling back to simulation', walletError);
          }
        }
      }

  const { address, assets } = await adapter.connect();
      dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address } });
      dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: assets });
    } catch (error) {
      logger.error(`[wallet:${adapter.name}] connect failed`, error);
      throw error;
    } finally {
      dispatch({ type: 'SET_CONNECTING', payload: false });
    }
  }, [adapter, dispatch, state.isConnecting, state.walletConnected, uw]);

  const disconnect = useCallback(() => {
    dispatch({ type: 'RESET_WALLET' });
    if (uw && uw.activeWallet) {
      uw.activeWallet.disconnect().catch((error: unknown) => logger.warn('[use-wallet] disconnect failed', error));
    }
    adapter.disconnect().catch((error) => {
      logger.warn(`[wallet:${adapter.name}] disconnect failed`, error);
    });
  }, [adapter, dispatch, uw]);

  const refreshAssets = useCallback(async () => {
    const address = state.walletAddress;
    if (!address) return;
    try {
      const balances = await adapter.refreshAssets(address);
      dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: balances });
    } catch (error) {
      logger.warn(`[wallet:${adapter.name}] asset refresh failed`, error);
    }
  }, [adapter, dispatch, state.walletAddress]);

  const signTransactions = useCallback(async (txns: algosdk.Transaction[]) => {
    // Prefer library's signer when available
    if (uw && uw.signTransactions) {
      const blobs = txns.map((t) => t.toByte());
      const signed = await uw.signTransactions(blobs);
      return signed.map((value) => normalizeSignedValue(value));
    }
    return adapter.signTransactions(txns);
  }, [adapter, uw]);

  // Sync uw activeAddress to state and refresh assets
  useEffect(() => {
    if (uw?.activeAddress && !state.walletConnected) {
      dispatch({ type: 'SET_WALLET_CONNECTION', payload: { connected: true, address: uw.activeAddress } });
      // Refresh assets for the new address
      adapter.refreshAssets(uw.activeAddress).then((assets) => {
        dispatch({ type: 'SET_ACCOUNT_ASSETS', payload: assets });
      }).catch((error) => {
        logger.warn('[wallet] asset refresh failed on connect', error);
      });
    }
  }, [uw?.activeAddress, adapter, dispatch, state.walletConnected]);

  return {
    connect,
    disconnect,
    refreshAssets,
    signTransactions,
    connected: state.walletConnected || !!uw?.activeAddress,
    address: state.walletAddress || (uw?.activeAddress ?? undefined),
    assets: state.accountAssets,
    connecting: state.isConnecting,
    mode: chainConfig.mode,
  };
}
