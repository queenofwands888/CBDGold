import React, { useState, useEffect } from 'react';
import { STAKING_POOLS } from '../../data/constants';
import FeatherIcon from '../FeatherIcon';
import { useAppContext } from '../../contexts';
import { useNotify } from '../../hooks/useNotify';
import { useAppTransactions } from '../../hooks/useAppTransactions';

const StakingPanel: React.FC = () => {
  const { state } = useAppContext();
  const [pending, setPending] = useState<number | null>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    async function fetchPending() {
      setPendingLoading(true);
      try {
        if (state.walletConnected && state.walletAddress) {
          const local = await import('../../onchain/staking').then(m => m.fetchStakingLocalState(state.walletAddress));
          if (mounted) {
            // StakingLocalState only has 'staked' and 'rewards'. Use 'staked' as pending value or set to 0.
            setPending(typeof local?.staked === 'number' ? local.staked : 0);
          }
        } else {
          setPending(null);
        }
      } catch { setPending(null); }
      setPendingLoading(false);
    }
    fetchPending();
    return () => { mounted = false; };
  }, [state.walletConnected, state.walletAddress, state.stakedAmount]);
  const { notify } = useNotify();
  const { accountAssets } = state;
  const { stakeHemp, unstakeHemp, claimStakingRewards } = useAppTransactions();
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [loadingAction, setLoadingAction] = useState<{ [key: string]: boolean }>({});

  const stake = async (poolId: number) => {
    const pool = STAKING_POOLS.find(p => p.id === poolId)!;
    const raw = parseFloat(amounts[poolId] || '');
    if (!raw || raw <= 0) { notify('Enter amount in HEMP', 'warning'); return; }
    const atomic = Math.floor(raw);
    if (atomic < pool.minStake) { notify(`Minimum ${pool.minStake.toLocaleString()} HEMP for ${pool.name}`, 'error'); return; }
    if (atomic > accountAssets.hemp) { notify('Insufficient HEMP balance', 'error'); return; }
    setLoadingAction(a => ({ ...a, [`stake-${poolId}`]: true }));
    try {
      await stakeHemp(atomic);
      notify(`Submitting stake of ${atomic.toLocaleString()} HEMP into ${pool.name}...`, 'info');
    } finally {
      setLoadingAction(a => ({ ...a, [`stake-${poolId}`]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STAKING_POOLS.map(pool => (
          <div key={pool.id} className="glass-card rounded-2xl p-6">
            <div className="text-center">
              <div className={`w-16 h-16 bg-gradient-to-br ${pool.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                <FeatherIcon icon="lock" className="text-white" />
              </div>
              <h3 className="font-bold text-white text-xl mb-2">{pool.name}</h3>
              <div className={`inline-block px-4 py-2 rounded-full mb-4 bg-gradient-to-r ${pool.color}`}>
                <span className="text-black font-bold">{pool.discount}% OFF</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 mb-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-300">Min Stake:</span><span className="text-green-400">{pool.minStake.toLocaleString()} HEMP</span></div>
                <div className="flex justify-between"><span className="text-gray-300">APY:</span><span className="text-blue-400">{pool.apy}%</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Shipping:</span><span className="text-purple-400">{pool.shipping}</span></div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-300 font-semibold mb-2">Benefits:</p>
                <div className="space-y-1 text-left">
                  {pool.benefits.map(b => <p key={b} className="text-xs text-yellow-400">• {b}</p>)}
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder={`Min ${pool.minStake.toLocaleString()} HEMP`}
                  value={amounts[pool.id] || ''}
                  onChange={e => setAmounts(a => ({ ...a, [pool.id]: e.target.value }))}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => stake(pool.id)}
                    disabled={!!loadingAction[`stake-${pool.id}`]}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all bg-gradient-to-r ${pool.color} text-black hover:opacity-90 ${loadingAction[`stake-${pool.id}`] ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {loadingAction[`stake-${pool.id}`] ? 'Staking...' : 'Stake HEMP Tokens'}
                  </button>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={async () => {
                        const raw = parseFloat(amounts[pool.id] || '0');
                        if (!raw || raw <= 0) { notify('Enter unstake amount', 'warning'); return; }
                        setLoadingAction(a => ({ ...a, [`unstake-${pool.id}`]: true }));
                        try {
                          await unstakeHemp(Math.floor(raw));
                        } finally {
                          setLoadingAction(a => ({ ...a, [`unstake-${pool.id}`]: false }));
                        }
                      }}
                      disabled={!!loadingAction[`unstake-${pool.id}`]}
                      className={`bg-black/30 hover:bg-black/40 rounded-lg py-2 font-semibold text-yellow-300 ${loadingAction[`unstake-${pool.id}`] ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >{loadingAction[`unstake-${pool.id}`] ? 'Unstaking...' : 'Unstake'}</button>
                    <button
                      disabled={pendingLoading || !pending || pending <= 0 || !!loadingAction[`claim-${pool.id}`]}
                      onClick={async () => {
                        if (pending && pending > 0) {
                          setLoadingAction(a => ({ ...a, [`claim-${pool.id}`]: true }));
                          try {
                            await claimStakingRewards(pending);
                          } finally {
                            setLoadingAction(a => ({ ...a, [`claim-${pool.id}`]: false }));
                          }
                        }
                      }}
                      className={`bg-black/30 hover:bg-black/40 rounded-lg py-2 font-semibold text-green-300 disabled:opacity-50 ${loadingAction[`claim-${pool.id}`] ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {pendingLoading ? 'Loading...' : loadingAction[`claim-${pool.id}`] ? 'Claiming...' : `Claim${pending ? ` (${pending} HEMP)` : ''}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakingPanel;
