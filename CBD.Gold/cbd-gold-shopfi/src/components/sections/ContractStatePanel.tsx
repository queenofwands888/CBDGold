import React, { useEffect, useState } from 'react';
import { chainConfig } from '../../onchain/env';
import { fetchStakingGlobalState, fetchStakingLocalState } from '../../onchain/staking';
import { useAppContext } from '../../contexts';

const ContractStatePanel: React.FC = () => {
  const { state } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [g, setG] = useState<any>(null);
  const [l, setL] = useState<any>(null);

  const refresh = async () => {
    if (chainConfig.mode !== 'onchain' || !state.walletConnected) return;
    setLoading(true);
    try {
      const [gState, lState] = await Promise.all([
        fetchStakingGlobalState(),
        fetchStakingLocalState(state.walletAddress)
      ]);
      setG(gState);
      setL(lState);
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [state.walletConnected]);

  if (chainConfig.mode !== 'onchain') return null;

  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/60 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-blue-400 text-sm">Contract State</h3>
        <button onClick={refresh} disabled={loading} className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50">{loading ? '...' : 'Reload'}</button>
      </div>
      {!state.walletConnected && <p className="text-xs text-gray-500">Connect wallet to view on-chain state.</p>}
      {state.walletConnected && (
        <div className="text-xs font-mono space-y-2">
          <div><span className="text-gray-400">Staking App:</span> {chainConfig.stakingAppId}</div>
          <div><span className="text-gray-400">Asset ID:</span> {g?.assetId ?? '—'}</div>
          <div><span className="text-gray-400">Total Staked:</span> {g?.totalStaked ?? '—'}</div>
          <div><span className="text-gray-400">Reward Rate:</span> {g?.rewardRate ?? '—'}</div>
          <div className="border-t border-white/10 pt-2" />
          <div><span className="text-gray-400">Your Staked:</span> {l?.staked ?? '—'}</div>
          <div><span className="text-gray-400">Your Tier:</span> {l?.tier ?? '—'}</div>
          <div><span className="text-gray-400">Pending Rewards:</span> {l?.pending ?? '—'}</div>
        </div>
      )}
    </div>
  );
};

export default ContractStatePanel;
