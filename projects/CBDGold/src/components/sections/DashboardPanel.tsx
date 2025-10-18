import React from 'react';
import { useAppContext } from '../../contexts';
import FeatherIcon from '../FeatherIcon';
import { calculateStakingTier } from '../../utils/stakingTier';

const num = (v: number) => v.toLocaleString();

const DashboardPanel: React.FC = () => {
  const { state } = useAppContext();
  const { walletConnected, walletAddress, accountAssets, stakedAmount: staked } = state;
  const tier = calculateStakingTier(staked);
  const votingPower = Math.floor(accountAssets.weed / 0.001);

  return (
    <div className="space-y-8" data-testid="dashboard-root">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multi-Token Wallet Card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center"><FeatherIcon icon="leaf" className="mr-2 text-green-400" />Multi-Token Wallet</h3>
            {walletConnected ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Frontend Linked
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                Offline
              </span>
            )}
          </div>
          <div className="bg-black/30 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-300">Algorand Address:</p>
              <p className="font-mono text-xs text-green-400 break-all">{walletConnected ? walletAddress : 'Not connected'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-300">HEMP:</p><p className="text-green-400 font-bold">{num(accountAssets.hemp)}</p><p className="text-xs text-gray-500">ASA: 2675148574</p></div>
              <div><p className="text-gray-300">WEED:</p><p className="text-purple-400 font-bold">{num(accountAssets.weed)}</p><p className="text-xs text-gray-500">ASA: 2676316280</p></div>
              <div><p className="text-gray-300">ALGO:</p><p className="text-blue-400 font-bold">{accountAssets.algo.toFixed(2)}</p></div>
              <div><p className="text-gray-300">USDC:</p><p className="text-yellow-400 font-bold">${accountAssets.usdc.toFixed(2)}</p></div>
            </div>
          </div>
        </div>
        {/* Staking Tier Status Card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center"><FeatherIcon icon="award" className="mr-2 text-orange-400" />Staking Tier Status</h3>
          </div>
          <div className={`bg-gradient-to-r ${tier.color} rounded-lg p-4 mb-3`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-bold text-lg">{tier.name} Tier</p>
                <p className="text-black/80 text-sm">{tier.discount}% Off • {tier.apy}% APY</p>
              </div>
              <FeatherIcon icon="award" className="text-black" />
            </div>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-300">Staked HEMP:</span><span className="text-green-400">{num(staked)}</span></div>
            <div className="flex justify-between"><span className="text-gray-300">Shipping:</span><span className="text-blue-400">{tier.shipping}</span></div>
            <div className="flex justify-between"><span className="text-gray-300">Voting Power:</span><span className="text-purple-400">{num(votingPower)}</span></div>
          </div>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Available HEMP</p>
              <p className="text-3xl font-bold text-green-400">{(accountAssets.hemp / 1_000_000).toFixed(1)}M</p>
              <p className="text-xs text-gray-400">Ready to spend</p>
            </div>
            <FeatherIcon icon="leaf" className="text-green-400" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Staked HEMP</p>
              <p className="text-3xl font-bold text-blue-400">{(staked / 1_000_000).toFixed(1)}M</p>
              <p className="text-xs text-gray-400">Earning {tier.apy}% APY</p>
            </div>
            <FeatherIcon icon="lock" className="text-blue-400" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">WEED Governance</p>
              <p className="text-3xl font-bold text-purple-400">{num(accountAssets.weed)}</p>
              <p className="text-xs text-gray-400">{num(votingPower)} votes</p>
            </div>
            <FeatherIcon icon="users" className="text-purple-400" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">HEMP Winnings</p>
              <p className="text-3xl font-bold text-yellow-400">{num(accountAssets.hemp)}</p>
              <p className="text-xs text-gray-400">Spin rewards & loyalty drops</p>
            </div>
            <FeatherIcon icon="gift" className="text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
