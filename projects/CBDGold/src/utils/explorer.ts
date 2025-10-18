import { getNetworkLabel, isMainNet } from '../onchain/network';

const EXPLORERS = {
  mainnet: 'https://algoexplorer.io',
  testnet: 'https://testnet.algoexplorer.io',
  betanet: 'https://betanet.algoexplorer.io',
  localnet: 'http://localhost:8980',
};

const resolveExplorerBase = (): string => {
  const label = getNetworkLabel().toLowerCase();
  if (label.includes('main')) return EXPLORERS.mainnet;
  if (label.includes('beta')) return EXPLORERS.betanet;
  if (label.includes('local')) return EXPLORERS.localnet;
  return EXPLORERS.testnet;
};

export const getExplorerUrl = (path: string): string => {
  const base = resolveExplorerBase();
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export const getTxnUrl = (txId: string): string => getExplorerUrl(`tx/${txId}`);
export const getAppUrl = (appId: number | string): string => getExplorerUrl(`application/${appId}`);
export const getAccountUrl = (address: string): string => getExplorerUrl(`address/${address}`);

export const explorerName = () => (isMainNet() ? 'AlgoExplorer' : `${getNetworkLabel()} AlgoExplorer`);

export default {
  getExplorerUrl,
  getTxnUrl,
  getAppUrl,
  getAccountUrl,
  explorerName,
};
