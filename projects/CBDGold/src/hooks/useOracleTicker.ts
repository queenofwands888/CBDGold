import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOraclePrices, OraclePrices } from '../services/oraclePriceService';

type HistoryPoint = { t: number; v: number };

type OracleHistory = {
  algo: HistoryPoint[];
  hemp: HistoryPoint[];
};

const HISTORY_CAP = 120;
const POLL_INTERVAL_MS = 15_000;

const fallbackTemplate: Omit<OraclePrices, 'lastUpdated'> = {
  algoUsd: 0.25,
  hempUsd: 0.0001,
  weedUsd: 0.00008,
  usdcUsd: 1,
  source: { backend: false, fallback: true },
};

const buildFallback = (): OraclePrices => ({
  ...fallbackTemplate,
  lastUpdated: Date.now(),
});

const appendPoint = (arr: HistoryPoint[], value: number): HistoryPoint[] => {
  const next = [...arr, { t: Date.now(), v: value }];
  if (next.length > HISTORY_CAP) {
    return next.slice(next.length - HISTORY_CAP);
  }
  return next;
};

const percentChange = (previous?: number, next?: number): number | undefined => {
  if (previous === undefined || next === undefined) return undefined;
  if (!isFinite(previous) || previous === 0) return undefined;
  if (!isFinite(next)) return undefined;
  return ((next - previous) / previous) * 100;
};

export interface OracleTicker {
  oracle: OraclePrices;
  lastLiveOracle: OraclePrices | null;
  history: OracleHistory;
  priceDelta: { algoPct?: number; hempPct?: number; weedPct?: number } | null;
  paused: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  togglePaused: () => void;
}

export function useOracleTicker(pollInterval: number = POLL_INTERVAL_MS): OracleTicker {
  const [oracle, setOracle] = useState<OraclePrices>(() => buildFallback());
  const [lastLiveOracle, setLastLiveOracle] = useState<OraclePrices | null>(null);
  const [history, setHistory] = useState<OracleHistory>({ algo: [], hemp: [] });
  const [priceDelta, setPriceDelta] = useState<{ algoPct?: number; hempPct?: number; weedPct?: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevRef = useRef<OraclePrices | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateStateFromPrices = useCallback((next: OraclePrices) => {
    setOracle(next);
    setHistory(prev => ({
      algo: appendPoint(prev.algo, next.algoUsd),
      hemp: appendPoint(prev.hemp, next.hempUsd),
    }));

    const previous = prevRef.current;
    setPriceDelta(() => {
      if (!previous) return null;
      return {
        algoPct: percentChange(previous.algoUsd, next.algoUsd),
        hempPct: percentChange(previous.hempUsd, next.hempUsd),
        weedPct: percentChange(previous.weedUsd, next.weedUsd),
      };
    });

    if (next.source.backend) {
      setLastLiveOracle(next);
    }

    prevRef.current = next;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOraclePrices();
      if (!isMounted.current || !data) return;
      updateStateFromPrices({ ...data, lastUpdated: Date.now() });
    } catch (error) {
      if (!isMounted.current) return;
      console.warn('Failed to refresh oracle prices; using fallback', error);
      updateStateFromPrices(buildFallback());
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [updateStateFromPrices]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      refresh();
    }, pollInterval);
    return () => window.clearInterval(id);
  }, [paused, pollInterval, refresh]);

  const togglePaused = useCallback(() => setPaused(prev => !prev), []);

  const memoisedOracle = useMemo(() => oracle, [oracle]);
  const memoHistory = useMemo(() => history, [history]);
  const memoDelta = useMemo(() => priceDelta, [priceDelta]);

  return {
    oracle: memoisedOracle,
    lastLiveOracle,
    history: memoHistory,
    priceDelta: memoDelta,
    paused,
    loading,
    refresh,
    togglePaused,
  };
}

export default useOracleTicker;
