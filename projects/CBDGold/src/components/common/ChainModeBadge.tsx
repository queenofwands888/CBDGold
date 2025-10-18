import React from 'react';
import { chainConfig } from '../../onchain/env';
import { getNetworkLabel } from '../../onchain/network';

const badgeTheme = chainConfig.mode === 'onchain'
  ? { gradient: 'from-emerald-400 to-green-600 text-black', pulse: 'bg-green-200' }
  : { gradient: 'from-gray-500 to-gray-700 text-white', pulse: 'bg-gray-200' };

export const ChainModeBadge: React.FC = () => {
  const label = chainConfig.mode === 'onchain' ? `On-Chain Active • ${getNetworkLabel()}` : 'Simulation Mode';
  const title = chainConfig.mode === 'onchain'
    ? `Transactions broadcast to Algorand ${getNetworkLabel()}`
    : 'Simulation Mode (no real network calls)';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${badgeTheme.gradient} shadow-lg border border-white/10`}
         title={title}>
      <span className={`w-2.5 h-2.5 rounded-full ${badgeTheme.pulse} animate-pulse`} />
      {label}
    </div>
  );
};

export default ChainModeBadge;
