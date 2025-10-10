import React from 'react';
import { PRIZE_TIERS } from '../../data/constants';

const rarityColors: Record<string,string> = {
  JACKPOT: 'bg-gradient-to-r from-fuchsia-500 to-yellow-400',
  RARE: 'bg-gradient-to-r from-indigo-400 to-sky-500',
  LEGENDARY: 'bg-gradient-to-r from-amber-400 to-orange-600',
  GOLDEN: 'bg-gradient-to-r from-yellow-300 to-yellow-500'
};

const PrizeLegend: React.FC = () => {
  return (
    <div className="bg-black/30 rounded-lg p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Prize Tiers</p>
      <div className="space-y-2">
        {PRIZE_TIERS.map(t => (
          <div key={t.id} className="flex items-start gap-2">
            <div className={`h-4 w-4 rounded-full ring-2 ring-white/20 ${rarityColors[t.rarity]}`} />
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-gray-200">{t.rarity}: <span className="text-white">{t.label}</span>{t.discountPct ? ` (${t.discountPct}% Off)` : ''}</p>
              <p className="text-[10px] text-gray-500 leading-snug">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-gray-500 mt-1">NFT & coupon logic placeholder; real claims will route through prize contract.</p>
    </div>
  );
};

export default PrizeLegend;
