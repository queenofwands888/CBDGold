// Lightweight utility to simulate a transaction lifecycle for UI demonstration
// until real on-chain interactions are wired in.
// Provides a cancellable promise interface.

export interface SimulatedTxOptions {
  minDelayMs?: number; // minimal pending duration
  maxDelayMs?: number; // maximal pending duration
  failRate?: number;   // probability (0-1) of simulated failure
  actionLabel?: string;
}

export interface SimulatedTxResult {
  txId?: string;
  error?: string;
  status: 'confirmed' | 'failed';
}

export type TxStatusCallback = (status: 'pending' | 'confirmed' | 'failed', txId?: string, error?: string) => void;

export function simulateTransaction(cb: TxStatusCallback, opts: SimulatedTxOptions = {}): { cancel: () => void; promise: Promise<SimulatedTxResult>; } {
  // Allow overriding default fail rate via Vite env var (e.g. VITE_TX_SIM_FAIL_RATE=0)
  const envFailRateRaw = import.meta?.env?.VITE_TX_SIM_FAIL_RATE;
  const parsedEnvFailRate = envFailRateRaw !== undefined ? Number(envFailRateRaw) : undefined;
  const resolvedFailRate: number = typeof opts.failRate === 'number' && !Number.isNaN(opts.failRate)
    ? opts.failRate
    : (typeof parsedEnvFailRate === 'number' && Number.isFinite(parsedEnvFailRate) ? parsedEnvFailRate : 0.1);
  const { minDelayMs = 900, maxDelayMs = 1900 } = opts;
  let cancelled = false;
  cb('pending');
  const delay = Math.floor(minDelayMs + Math.random() * (maxDelayMs - minDelayMs));

  const promise = new Promise<SimulatedTxResult>((resolve) => {
    setTimeout(() => {
      if (cancelled) return resolve({ status: 'failed', error: 'Cancelled' });
      const failed = Math.random() < resolvedFailRate;
      if (failed) {
        const error = 'Simulated failure';
        cb('failed', undefined, error);
        return resolve({ status: 'failed', error });
      }
      const txId = 'SIMULATED_TX_' + Math.random().toString(36).slice(2, 12);
      cb('confirmed', txId);
      resolve({ status: 'confirmed', txId });
    }, delay);
  });

  return {
    cancel: () => { cancelled = true; },
    promise
  };
}
