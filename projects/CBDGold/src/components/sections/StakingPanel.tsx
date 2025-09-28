import React, { useState } from 'react';
import { STAKING_POOLS } from '../../data/constants';
import FeatherIcon from '../FeatherIcon';
import { useAppContext } from '../../contexts';
import { useNotify } from '../../hooks/useNotify';
import { useAppTransactions } from '../../hooks/useAppTransactions';

const StakingPanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { notify } = useNotify();
  const { accountAssets, stakedAmount } = state;
  const { stakeHemp } = useAppTransactions();
  const [amounts, setAmounts] = useState<Record<number, string>>({});

  const stake = (poolId: number): void => {
    const pool = STAKING_POOLS.find(p => p.id === poolId)!;
    const raw = parseFloat(amounts[poolId] || '');
  if (!raw || raw <= 0) { notify('Enter amount in HEMP', 'warning'); return; }
    const atomic = Math.floor(raw); // currently treat raw as atomic tokens
  if (atomic < pool.minStake) { notify(`Minimum ${pool.minStake.toLocaleString()} HEMP for ${pool.name}`, 'error'); return; }
  if (atomic > accountAssets.hemp) { notify('Insufficient HEMP balance', 'error'); return; }
  stakeHemp(atomic);
    notify(`Submitting stake of ${atomic.toLocaleString()} HEMP into ${pool.name}...`, 'info');
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
                <button
                  onClick={() => stake(pool.id)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all bg-gradient-to-r ${pool.color} text-black hover:opacity-90`}
                >
                  Stake HEMP Tokens
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakingPanel;
