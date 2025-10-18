import React, { useState } from 'react';
import FeatherIcon from '../FeatherIcon';
import { useSnackbar } from 'notistack';
import { STAKING_POOLS, StakingPool } from '../../data/constants';
import { sanitizeInput, validateNumericInput, isRateLimited, SecurityConfig } from '../../utils/security';
import { stakeHemp } from '../../contracts/client/stakingClient';

interface StakingSectionProps {
  walletConnected: boolean;
  hempBalance: number;
  walletAddress: string;
  onStake: (pool: StakingPool, amount: number) => void;
  onUnstake?: (pool: StakingPool, amount: number) => void;
  onTxStatus?: (status: 'pending' | 'confirmed' | 'failed', txId?: string, error?: string) => void;
}

const StakingSection: React.FC<StakingSectionProps> = ({ walletConnected, hempBalance, walletAddress, onStake, onUnstake, onTxStatus }) => {
  const [stakingAmounts, setStakingAmounts] = useState<{ [key: number]: string }>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleStake = async (pool: StakingPool) => {
    if (isRateLimited('staking_attempts', 5, 300000)) {
      enqueueSnackbar('Too many staking attempts. Please wait a few minutes.', { variant: 'error' });
      return;
    }
    const raw = stakingAmounts[pool.id] || '';
    const validation = validateNumericInput(raw, pool.minStake, SecurityConfig.MAX_STAKING_AMOUNT);
    if (!validation.isValid) {
      enqueueSnackbar(validation.error || 'Invalid staking amount', { variant: 'warning' });
      return;
    }
    const amount = validation.sanitizedValue!;
    if (amount > hempBalance) {
      enqueueSnackbar('Insufficient HEMP balance.', { variant: 'error' });
      return;
    }
    try {
      onTxStatus?.('pending');
      const tx = await stakeHemp(walletAddress, amount);
      onTxStatus?.('confirmed', tx.txId);
      enqueueSnackbar('Staking successful!', { variant: 'success' });
      onStake(pool, amount);
      setStakingAmounts({ ...stakingAmounts, [pool.id]: '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Staking failed';
      onTxStatus?.('failed', undefined, message);
      enqueueSnackbar('Staking failed', { variant: 'error' });
    }
  };

  const handleUnstake = async (pool: StakingPool) => {
    // Placeholder logic: In real integration we would query staked amount per pool; using entered amount for demo.
    const raw = stakingAmounts[pool.id] || '';
    const validation = validateNumericInput(raw, 1, SecurityConfig.MAX_STAKING_AMOUNT);
    if (!validation.isValid) {
      enqueueSnackbar(validation.error || 'Invalid unstake amount', { variant: 'warning' });
      return;
    }
    const amount = validation.sanitizedValue!;
    try {
      onTxStatus?.('pending');
      // Reuse simulate staking client for now; future: call unstake contract method
      const tx = await stakeHemp(walletAddress, 0); // simulate immediate return
      onTxStatus?.('confirmed', tx.txId);
      enqueueSnackbar('Unstake successful (simulated)', { variant: 'success' });
      onUnstake?.(pool, amount);
      setStakingAmounts({ ...stakingAmounts, [pool.id]: '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unstake failed';
      onTxStatus?.('failed', undefined, message);
      enqueueSnackbar('Unstake failed', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">HEMP Token ShopFi</h2>
        <p className="text-gray-300">Stake HEMP tokens to unlock tiered discounts and exclusive benefits</p>
      </div>
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
              <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-gray-300">Min Stake:</span><span className="text-green-400">{(pool.minStake / 1000000).toFixed(1)}M HEMP</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">APY:</span><span className="text-blue-400">{pool.apy}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Shipping:</span><span className="text-purple-400">{pool.shipping}</span></div>
                </div>
              </div>
              <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-300 font-semibold mb-2">Benefits:</p>
                <div className="space-y-1">{pool.benefits.map((b, i) => (<p key={i} className="text-xs text-yellow-400">• {b}</p>))}</div>
              </div>
              <div className="space-y-3">
                <input type="number" placeholder={`Min ${(pool.minStake / 1000000).toFixed(1)}M HEMP`} value={stakingAmounts[pool.id] || ''} onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value).replace(/[^0-9.]/g, '');
                  setStakingAmounts({ ...stakingAmounts, [pool.id]: sanitized });
                }} className="w-full bg-black bg-opacity-30 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm" />
                <div className="flex space-x-2">
                  <button onClick={() => handleStake(pool)} disabled={!walletConnected} className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${walletConnected ? `bg-gradient-to-r ${pool.color} text-black hover:opacity-90` : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>Stake</button>
                  <button onClick={() => handleUnstake(pool)} disabled={!walletConnected} className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${walletConnected ? 'bg-black/40 text-yellow-300 hover:bg-black/60' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>Unstake</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakingSection;
