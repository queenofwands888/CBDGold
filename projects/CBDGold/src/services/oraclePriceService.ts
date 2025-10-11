// Oracle Price Service: Aggregates pricing from backend and fallback sources.
// Future extension: Integrate AMM/DEX spot (Tinyman, Pact) or external oracle (Pyth, etc.)
import { logger } from '../utils/logger';

export interface OraclePrices {
  algoUsd: number;
  hempUsd: number;
  weedUsd: number;
  usdcUsd: number; // typically 1
  source: { backend: boolean; fallback: boolean };
  lastUpdated: number;
}

const FALLBACK: OraclePrices = {
  algoUsd: 0.25,
  hempUsd: 0.0001,
  weedUsd: 0.00008,
  usdcUsd: 1,
  source: { backend: false, fallback: true },
  lastUpdated: Date.now(),
};

let cache: OraclePrices | null = null;
const TTL = 30_000; // 30s cache

export async function getOraclePrices(baseUrl?: string): Promise<OraclePrices> {
  if (cache && Date.now() - cache.lastUpdated < TTL) return cache;
  const apiBase = baseUrl || (import.meta.env.VITE_API_URL || 'http://localhost:3001');
  try {
    const res = await fetch(`${apiBase}/api/prices`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const p = data?.prices || data || {};
    const algoUsd = numberOr(p.ALGO, p.algo, p.algoUsd);
    const hempUsd = numberOr(p.HEMP, p.hemp, p.hempUsd);
    const weedUsd = numberOr(p.WEED, p.weed, p.weedUsd);
    const usdcUsd = numberOr(p.USDC, p.usdc, p.usdcUsd, 1);
    if (!isFinite(algoUsd) || algoUsd <= 0 || !isFinite(hempUsd) || hempUsd <= 0 || !isFinite(weedUsd) || weedUsd <= 0) {
  logger.warn('Invalid oracle values, using fallback');
      cache = { ...FALLBACK, lastUpdated: Date.now() };
      return cache;
    }
    cache = {
      algoUsd,
      hempUsd,
      weedUsd,
      usdcUsd: usdcUsd > 0 ? usdcUsd : 1,
      source: { backend: true, fallback: false },
      lastUpdated: Date.now(),
    };
    return cache;
  } catch (err) {
  logger.error('Oracle fetch failed, using fallback', err);
    cache = { ...FALLBACK, lastUpdated: Date.now() };
    return cache;
  }
}

function numberOr(...vals: any[]): number {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (isFinite(n)) return n;
  }
  return NaN;
}

export function clearOracleCache() { cache = null; }
