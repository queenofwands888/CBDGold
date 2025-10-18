import React, { useState, useEffect } from 'react';
import type { OraclePrices } from '../services/oraclePriceService';
import type { OracleTicker } from '../hooks/useOracleTicker';
import { chainConfig } from '../onchain/env';
import { getNetworkLabel } from '../onchain/network';

type PriceHistory = OracleTicker['history'];
type PriceDelta = OracleTicker['priceDelta'];

export interface PriceBarProps {
  oracleMeta: OraclePrices | null | undefined;
  lastLiveOracle: OraclePrices | null;
  priceDelta: PriceDelta;
  history?: PriceHistory;
}

function Delta({ value }: { value?: number }) {
  if (value === undefined || value === null || isNaN(value)) return null;
  const sign = value > 0 ? '+' : '';
  const cls = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-300';
  return <span className={cls}>{sign}{value.toFixed(2)}%</span>;
}

const PriceBar: React.FC<PriceBarProps> = ({ oracleMeta, lastLiveOracle, priceDelta, history }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!oracleMeta) return null;
  const ageSec = Math.max(0, Math.round((now - oracleMeta.lastUpdated) / 1000));
  const live = !!oracleMeta.source?.backend && !oracleMeta.source?.fallback;
  const badgeTheme = live
    ? { pill: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40', dot: 'bg-emerald-300' }
    : { pill: 'bg-amber-500/15 text-amber-200 border border-amber-400/40', dot: 'bg-amber-300' };
  const onChain = chainConfig.mode === 'onchain';
  const networkName = onChain ? getNetworkLabel() : 'Simulation Mode';
  // Prepare sparkline (ALGO)
  let sparkPath: string | null = null;
  const algoHistory = history?.algo ?? [];
  if (algoHistory.length > 1) {
    const pts = algoHistory.slice(-60); // last 60 points
    const values = pts.map(p => p.v);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const w = 120; const h = 30;
    sparkPath = pts.map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p.v - min) / span) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
  const tokens = [
    {
      label: 'ALGO',
      value: oracleMeta.algoUsd,
      precision: 3,
      color: 'text-blue-400',
      delta: priceDelta?.algoPct,
      footnote: 'Core network'
    },
    {
      label: 'HEMP',
      value: oracleMeta.hempUsd,
      precision: 6,
      color: 'text-brand-emerald',
      delta: priceDelta?.hempPct,
      footnote: 'CBD Rewards'
    },
    {
      label: 'WEED',
      value: oracleMeta.weedUsd,
      precision: 6,
      color: 'text-pink-400',
      delta: priceDelta?.weedPct,
      footnote: 'Governance'
    },
    {
      label: 'USDC',
      value: oracleMeta.usdcUsd,
      precision: 2,
      color: 'text-yellow-300',
      footnote: 'Stablepair',
      delta: undefined
    }
  ] as const;

  return (
    <div className="w-full">
      <div className="animate-slideUp w-full max-w-6xl mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl px-6 py-5 shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeTheme.pill}`}>
              <span className={`w-2 h-2 rounded-full ${badgeTheme.dot} animate-pulse`} />
              {live ? 'Live Oracle Feed' : 'Fallback Feed'}
            </span>
            <div>
              <p className="text-[13px] text-gray-200 font-semibold uppercase tracking-[0.16em]">Price Oracle</p>
              <p className="text-xs text-gray-400">Updated {ageSec}s ago</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em] text-gray-200">
              {networkName}
            </span>
            {lastLiveOracle && !live && (
              <span className="text-amber-300">Last live {Math.round((now - lastLiveOracle.lastUpdated) / 1000)}s ago</span>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tokens.map(token => (
            <div key={token.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all hover:border-white/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{token.label}</span>
                <Delta value={token.delta} />
              </div>
              <p className={`mt-1 text-lg font-semibold ${token.color}`}>
                ${token.value !== undefined && token.value !== null ? token.value.toFixed(token.precision) : '0.000'}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">{token.footnote}</p>
            </div>
          ))}
        </div>
        {sparkPath && (
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                AL
              </span>
              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] text-gray-400">Algo Momentum</p>
                <p className="text-xs text-gray-200">Sparklines from the last hour</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg width={160} height={36} className="opacity-80">
                <path d={sparkPath} fill="none" stroke="#34d399" strokeWidth={1.5} />
              </svg>
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">ALGO</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceBar;
