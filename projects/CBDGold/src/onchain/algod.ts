import algosdk from 'algosdk';
import { chainConfig } from './env';

// Creates an algod client based on env (TestNet / LocalNet). For production, inject externally.
export function getAlgodClient() {
  const server = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
  const token = (import.meta.env.VITE_ALGOD_TOKEN || '');
  const port = import.meta.env.VITE_ALGOD_PORT || '';
  return new algosdk.Algodv2(token, server, port);
}

export function isOnChain() {
  return chainConfig.mode === 'onchain';
}
