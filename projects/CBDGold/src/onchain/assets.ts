import algosdk from 'algosdk';
import { chainConfig } from './env';

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
    const acct = await algod.accountInformation(address).do();
    const amt = typeof acct.amount === 'bigint' ? Number(acct.amount) : acct.amount;
    algo = Number((amt / 1_000_000).toFixed(3));
    const assets: any[] = acct.assets || [];
    for (const a of assets) {
      const id = typeof a['asset-id'] === 'bigint' ? Number(a['asset-id']) : a['asset-id'];
      const bal = typeof a.amount === 'bigint' ? Number(a.amount) : a.amount;
      if (id === chainConfig.hempAsaId) hemp = bal; // raw units; optionally scale later
      if (id === chainConfig.weedAsaId) weed = bal;
      if (id === chainConfig.usdcAsaId) usdc = bal / 1_000_000; // assuming 6 decimals
    }
  } catch (e) {
    console.warn('ASA balance fetch failed; using zeros', e);
  }
  return { algo, hemp, weed, usdc };
}
