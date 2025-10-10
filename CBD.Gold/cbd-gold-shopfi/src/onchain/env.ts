// On-chain environment bindings
// Reads Vite env variables and exposes typed config.

export interface ChainConfig {
  stakingAppId?: number;
  governanceAppId?: number;
  prizeAppId?: number;
  hempAsaId?: number;
  weedAsaId?: number;
  usdcAsaId?: number;
  mode: 'simulation' | 'onchain';
  network?: string;
}

function parseNum(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const chainConfig: ChainConfig = (() => {
  const stakingAppId = parseNum(import.meta.env.VITE_STAKING_APP_ID);
  const governanceAppId = parseNum(import.meta.env.VITE_GOV_APP_ID);
  const prizeAppId = parseNum(import.meta.env.VITE_PRIZE_APP_ID);
  const hempAsaId = parseNum(import.meta.env.VITE_HEMP_ASA_ID);
  const weedAsaId = parseNum(import.meta.env.VITE_WEED_ASA_ID);
  const usdcAsaId = parseNum(import.meta.env.VITE_USDC_ASA_ID);
  const network = import.meta.env.VITE_ALGOD_NETWORK;
  const enabled = !!(stakingAppId && governanceAppId && prizeAppId && hempAsaId);
  return {
    stakingAppId,
    governanceAppId,
    prizeAppId,
    hempAsaId,
    weedAsaId,
    usdcAsaId,
    mode: enabled ? 'onchain' : 'simulation',
    network
  };
})();

