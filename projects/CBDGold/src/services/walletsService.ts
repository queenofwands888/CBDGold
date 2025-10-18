// Wallets service now relies on environment variables or optional API endpoint.
import { logger } from '../utils/logger';

export type WalletsResponse = {
  hot: string;
  treasury: string;
  operational?: string;
};

const {
  VITE_API_URL,
  VITE_HOT_WALLET,
  VITE_TREASURY_ADDRESS,
  VITE_OPERATIONAL_WALLET,
} = import.meta.env;

const apiBase = VITE_API_URL?.trim();

const envWallets: WalletsResponse = {
  hot: VITE_HOT_WALLET ?? '',
  treasury: VITE_TREASURY_ADDRESS ?? '',
  operational: VITE_OPERATIONAL_WALLET || undefined,
};

export async function fetchWallets(): Promise<WalletsResponse> {
  if (!apiBase) {
    return envWallets;
  }

  try {
    const res = await fetch(`${apiBase}/api/wallets`);
    if (!res.ok) throw new Error(`Failed to fetch wallets: ${res.status}`);
    return res.json();
  } catch (error) {
    logger.warn('Wallet API unavailable, falling back to env-configured addresses.', error);
    return envWallets;
  }
}

export default { fetchWallets };
