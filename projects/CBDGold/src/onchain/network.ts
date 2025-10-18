import { chainConfig } from './env';

export const getNetworkLabel = (): string => {
  const raw = (chainConfig.network || '').toLowerCase();
  if (!raw) return chainConfig.mode === 'onchain' ? 'Network: Unknown' : 'Simulation Only';
  if (raw.includes('main')) return 'MainNet';
  if (raw.includes('test')) return 'TestNet';
  if (raw.includes('beta')) return 'BetaNet';
  if (raw.includes('local')) return 'LocalNet';
  return chainConfig.network ?? 'Custom';
};

export const isTestNet = (): boolean => getNetworkLabel().toLowerCase().includes('test');
export const isMainNet = (): boolean => getNetworkLabel().toLowerCase().includes('main');
