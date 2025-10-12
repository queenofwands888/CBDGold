import React, { useState, useEffect, useMemo } from 'react';
import FeatherIcon from '../FeatherIcon';
import { useAppContext } from '../../contexts';
import { useAppTransactions } from '../../hooks/useAppTransactions';
import { useNotify } from '../../hooks/useNotify';
import { calculateStakingTier } from '../../utils/stakingTier';
import { ECON_CONFIG, PRIZE_TIERS } from '../../data/constants';

const formatDuration = (ms: number) => {
  if (ms <= 0) return 'expired';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const SpinGamePanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { spinBonusDiscount, lastSpinResult, spinBonusExpiresAt, stakedAmount } = state;
  const { creditSpinHemp } = useAppTransactions();
  const { notify } = useNotify();
  const [isSpinning, setIsSpinning] = useState(false);
  const [localResult, setLocalResult] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const stakingTier = useMemo(() => calculateStakingTier(stakedAmount), [stakedAmount]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = spinBonusExpiresAt ? spinBonusExpiresAt - Date.now() : 0;
  if (spinBonusExpiresAt && remainingMs <= 0 && spinBonusDiscount > 0) {
    dispatch({ type: 'CLEAR_SPIN_BONUS' });
  }

  const outcomes = useMemo(() => {
    // Weighted array: include prize tiers with pseudo-weights; real probability logic should be server or contract-side
    const base = [
      { label: '50,000 HEMP', type: 'hemp' as const, amount: 50_000, weight: 24 },
      { label: '100,000 HEMP', type: 'hemp' as const, amount: 100_000, weight: 16 },
      { label: '200,000 HEMP', type: 'hemp' as const, amount: 200_000, weight: 8 },
      { label: '10% Discount', type: 'discount' as const, amount: 10, weight: 10 },
      { label: '25% Discount', type: 'discount' as const, amount: 25, weight: 4 },
      { label: '🎉 1M HEMP JACKPOT', type: 'hemp' as const, amount: 1_000_000, weight: 1 }
    ];

    const prizeWrapped = PRIZE_TIERS.map(t => ({
      label: `${t.rarity} • ${t.label}`,
      type: 'prize' as const,
      prizeId: t.id,
      discountPct: t.discountPct,
      rarity: t.rarity,
      weight: t.rarity === 'JACKPOT' ? 1 : t.rarity === 'RARE' ? 2 : t.rarity === 'LEGENDARY' ? 3 : 6
    }));

    // Expand list via weights (simple client-side approach; not secure for production odds)
    const expanded: any[] = [];
    [...base, ...prizeWrapped].forEach(o => {
      for (let i = 0; i < (o.weight || 1); i++) expanded.push(o);
    });
    return expanded;
  }, []);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setLocalResult(null);
    setTimeout(() => {
      const result: any = outcomes[Math.floor(Math.random() * outcomes.length)];
      setLocalResult(result.label);
      if (result.type === 'discount') {
        dispatch({ type: 'SET_SPIN_BONUS', payload: { discount: result.amount, result: result.label } });
        notify(`+${result.amount}% bonus discount applied (next purchase or ${ECON_CONFIG.SPIN_BONUS_DURATION_MS / 60000}m)`, 'info');
      } else if (result.type === 'hemp') {
        creditSpinHemp(result.amount);
        notify(`Credited ${result.amount.toLocaleString()} HEMP!`, 'success');
      } else if (result.type === 'prize') {
        dispatch({ type: 'SET_PRIZE_CLAIM_STATUS', payload: true });
        if (typeof result.discountPct === 'number') {
          // Treat coupon prizes as immediate spin bonus (stacking within cap) for now
          dispatch({ type: 'SET_SPIN_BONUS', payload: { discount: result.discountPct, result: result.label } });
          notify(`${result.label}: ${result.discountPct}% discount coupon applied (temp bonus)`, 'info');
        } else {
          // Placeholder: would trigger NFT mint / claim flow
          notify(`${result.label} won! (NFT claim placeholder)`, 'success');
        }
      }
      setIsSpinning(false);
    }, 2600);
  };

  const totalPotentialDiscount = Math.min(ECON_CONFIG.MAX_TOTAL_DISCOUNT, stakingTier.discount + spinBonusDiscount);

  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FeatherIcon icon="refresh-cw" className={isSpinning ? 'animate-spin-slow text-purple-400' : 'text-purple-400'} />
          Spin & Bonus
        </h3>
        {spinBonusDiscount > 0 ? (
          <span className="text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold">
            +{spinBonusDiscount}% Bonus • {formatDuration(remainingMs)}
          </span>
        ) : (
          <span className="text-[10px] text-gray-500">No active bonus</span>
        )}
      </div>

      <div className="bg-black/30 rounded-lg p-3 text-xs space-y-2">
        <div className="flex justify-between"><span className="text-gray-400">Staking Tier:</span><span className="text-green-400 font-semibold">{stakingTier.name} ({stakingTier.discount}%)</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Spin Bonus:</span><span className="text-pink-400 font-semibold">{spinBonusDiscount}%</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Effective Discount:</span><span className="text-yellow-400 font-semibold">{totalPotentialDiscount}%</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Cap:</span><span className="text-gray-300">{ECON_CONFIG.MAX_TOTAL_DISCOUNT}%</span></div>
      </div>

      <button
        disabled={isSpinning}
        onClick={spin}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg hover:from-purple-600 hover:to-pink-700 ${isSpinning ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <FeatherIcon icon="refresh-cw" className={isSpinning ? 'animate-spin-slow' : ''} />
        {isSpinning ? 'SPINNING...' : 'SPIN NOW'}
      </button>

      {(localResult || lastSpinResult) && (
        <div className="bg-black/30 rounded-lg p-3 text-center text-xs">
          <p className="text-gray-400 mb-1">Latest Result</p>
          <p className="font-bold text-green-400 text-sm">{localResult || lastSpinResult}</p>
        </div>
      )}

      <div className="bg-black/20 rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2 font-semibold">Possible Outcomes</p>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {/* Show unique set for legend (not every weighted duplicate) */}
          {[...new Map(outcomes.map(o => [o.label, o])).values()].map(o => (
            <div key={o.label} className="bg-black/30 rounded-md px-2 py-1 flex items-center justify-between gap-1">
              <span className="truncate text-gray-300">{o.label}</span>
              <span className={`text-[9px] font-bold ${o.type === 'discount' || o.discountPct ? 'text-pink-400' : o.type === 'prize' ? 'text-yellow-400' : 'text-green-400'}`}>{o.type === 'discount' || o.discountPct ? '%OFF' : o.type === 'prize' ? 'PRIZE' : 'HEMP'}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-gray-500 mt-3 leading-relaxed">Prize Tiers: JACKPOT (Full Range NFT), RARE (Single Vape NFT), LEGENDARY (25% Off NFT), GOLDEN (7% Off Coupon). Discount bonuses apply to next qualifying purchase or expire after {ECON_CONFIG.SPIN_BONUS_DURATION_MS / 60000} minutes. HEMP prizes credit immediately. NFT & coupon claims currently simulated.</p>
      </div>
    </div>
  );
};

export default SpinGamePanel;
