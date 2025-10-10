import React from 'react';
import { chainConfig } from '../../onchain/env';

const colors = chainConfig.mode === 'onchain'
  ? 'from-emerald-400 to-green-600 text-black'
  : 'from-gray-500 to-gray-700 text-white';

export const ChainModeBadge: React.FC = () => (
  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${colors} shadow-lg border border-white/10`}
       title={chainConfig.mode === 'onchain' ? `On-Chain Mode (${chainConfig.network || 'unknown'})` : 'Simulation Mode (no real network calls)'}>
    <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
    {chainConfig.mode === 'onchain' ? 'On-Chain Active' : 'Simulation Mode'}
  </div>
);

export default ChainModeBadge;
