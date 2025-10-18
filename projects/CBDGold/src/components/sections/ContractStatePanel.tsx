import React, { useCallback, useEffect, useState } from 'react';
import { chainConfig } from '../../onchain/env';
import { fetchStakingGlobalState, fetchStakingLocalState, type StakingGlobalState, type StakingLocalState } from '../../onchain/stakingTransactions';
import { useAppContext } from '../../contexts';

const ContractStatePanel: React.FC = () => {
  const { state } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [globalState, setGlobalState] = useState<StakingGlobalState | undefined>();
  const [localState, setLocalState] = useState<StakingLocalState | undefined>();

  const refresh = useCallback(async () => {
    if (chainConfig.mode !== 'onchain' || !state.walletConnected) return;
    setLoading(true);
    try {
      const [gState, lState] = await Promise.all([
        fetchStakingGlobalState(),
        fetchStakingLocalState(state.walletAddress)
      ]);
      setGlobalState(gState);
      setLocalState(lState);
    } finally {
      setLoading(false);
    }
  }, [state.walletConnected, state.walletAddress]);

  useEffect(() => { refresh(); }, [refresh]);

  if (chainConfig.mode !== 'onchain') return null;

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-blue-400">Contract State</h3>
        <button onClick={refresh} disabled={loading} className="text-xs px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-blue-500/30 hover:border-blue-400/50 disabled:opacity-50 transition-all">{loading ? '...' : 'Reload'}</button>
      </div>
      {!state.walletConnected && <p className="text-sm text-gray-400">Connect wallet to view on-chain state.</p>}
      {state.walletConnected && (
        <div className="text-xs font-mono space-y-2 bg-black/20 rounded-lg p-3">
          <div><span className="text-gray-400">Staking App:</span> <span className="text-white">{chainConfig.stakingAppId}</span></div>
          <div><span className="text-gray-400">Asset ID:</span> <span className="text-white">{globalState?.assetId ?? '—'}</span></div>
          <div><span className="text-gray-400">Total Staked:</span> <span className="text-white">{globalState?.totalStaked ?? '—'}</span></div>
          <div><span className="text-gray-400">Reward Rate:</span> {globalState?.rewardRate ?? '—'}</div>
          <div className="border-t border-white/10 pt-2" />
          <div><span className="text-gray-400">Your Staked:</span> {localState?.staked ?? '—'}</div>
          <div><span className="text-gray-400">Your Tier:</span> {localState?.tier ?? '—'}</div>
          <div><span className="text-gray-400">Pending Rewards:</span> {localState?.pending ?? '—'}</div>
        </div>
      )}
    </div>
  );
};

export default ContractStatePanel;
