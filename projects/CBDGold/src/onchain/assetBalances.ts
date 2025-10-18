import algosdk from 'algosdk';
import { chainConfig } from './env';
import { logger } from '../utils/logger';

export interface AsaBalances {
  algo: number;
  hemp: number;
  weed: number;
  usdc: number;
}

export async function fetchAsaBalances(address: string): Promise<AsaBalances> {
  const algodServer = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
  const algod = new algosdk.Algodv2('', algodServer, '');
  let algo = 0;
  let hemp = 0;
  let weed = 0;
  let usdc = 0;
  try {
    const acct = await algod.accountInformation(address).do() as {
      amount: number | bigint;
      assets?: Array<{ 'asset-id': number | bigint; amount: number | bigint }>;
    };
    const amt = typeof acct.amount === 'bigint' ? Number(acct.amount) : acct.amount;
    algo = Number((amt / 1_000_000).toFixed(3));
    const assets = Array.isArray(acct.assets) ? acct.assets : [];
    for (const holding of assets) {
      const id = typeof holding['asset-id'] === 'bigint' ? Number(holding['asset-id']) : holding['asset-id'];
      const bal = typeof holding.amount === 'bigint' ? Number(holding.amount) : holding.amount;
      if (id === chainConfig.hempAsaId) hemp = bal; // raw units; optionally scale later
      if (id === chainConfig.weedAsaId) weed = bal;
      if (id === chainConfig.usdcAsaId) usdc = bal / 1_000_000; // assuming 6 decimals
    }
  } catch (error) {
    logger.warn('ASA balance fetch failed; using zeros', error);
  }
  return { algo, hemp, weed, usdc };
}
