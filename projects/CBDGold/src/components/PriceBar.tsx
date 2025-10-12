import React from 'react';

interface PriceBarProps {
  oracleMeta: any;
  lastLiveOracle: any;
  priceDelta: { algoPct?: number; hempPct?: number; weedPct?: number } | null;
  history?: { algo: { t: number; v: number }[]; hemp: { t: number; v: number }[] };
  paused?: boolean;
  onTogglePaused?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

function Delta({ value }: { value?: number }) {
  if (value === undefined || value === null || isNaN(value)) return null;
  const sign = value > 0 ? '+' : '';
  const cls = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-300';
  return <span className={cls}>{sign}{value.toFixed(2)}%</span>;
}

const PriceBar: React.FC<PriceBarProps> = ({ oracleMeta, lastLiveOracle, priceDelta, history, paused, onTogglePaused, onRefresh, loading }) => {
  if (!oracleMeta) return null;
  const ageSec = Math.max(0, Math.round((Date.now() - oracleMeta.lastUpdated) / 1000));
  const live = !!oracleMeta.source?.backend && !oracleMeta.source?.fallback;
  const badgeColor = live ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
  // Prepare sparkline (ALGO)
  let sparkPath: string | null = null;
  if (history && history.algo.length > 1) {
    const pts = history.algo.slice(-60); // last 60 points
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
  return (
    <div className="w-full flex justify-center animate-slideUp">
      <div className="w-full max-w-6xl glass-card rounded-2xl px-6 py-4 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-2.5">
          <span className={`badge ${badgeColor} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full ${live ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            {live ? 'Live' : 'Fallback'} · {ageSec}s
          </span>
          {onTogglePaused && (
            <button
              onClick={onTogglePaused}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
                paused 
                  ? 'bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/25' 
                  : 'border-white/10 hover:bg-white/5 hover:border-white/20'
              }`}
              title="Pause/resume auto-refresh (Alt+P)"
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border border-white/10 transition-all ${
                loading 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-white/5 hover:border-brand-emerald/30'
              }`}
              title="Refresh prices (Alt+R)"
            >
              {loading ? '⟳ Loading...' : '↻ Refresh'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-gray-400 text-xs font-medium">ALGO</span>
            <span className="text-blue-400 font-bold">${oracleMeta.algoUsd?.toFixed(3) ?? '0.000'}</span>
            <Delta value={priceDelta?.algoPct} />
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-gray-400 text-xs font-medium">HEMP</span>
            <span className="text-brand-emerald font-bold">${oracleMeta.hempUsd?.toFixed(6) ?? '0.000000'}</span>
            <Delta value={priceDelta?.hempPct} />
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-gray-400 text-xs font-medium">WEED</span>
            <span className="text-pink-400 font-bold">${oracleMeta.weedUsd?.toFixed(6) ?? '0.000000'}</span>
            <Delta value={priceDelta?.weedPct} />
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-gray-400 text-xs font-medium">USDC</span>
            <span className="text-yellow-400 font-bold">${oracleMeta.usdcUsd?.toFixed(2) ?? '1.00'}</span>
          </div>
          {lastLiveOracle && !live && (
            <div className="text-xs text-orange-300">Reverted to fallback · last live {Math.round((Date.now() - lastLiveOracle.lastUpdated) / 1000)}s ago</div>
          )}
          {sparkPath && (
            <div className="flex items-center gap-1">
              <svg width={120} height={30} className="opacity-70">
                <path d={sparkPath} fill="none" stroke={paused ? '#f87171' : '#34d399'} strokeWidth={1.5} />
              </svg>
              <span className="text-[10px] text-gray-400">ALGO trend</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceBar;
