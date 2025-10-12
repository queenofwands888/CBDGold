// Service to fetch configured wallet addresses from backend
export type WalletsResponse = {
  hot: string;
  treasury: string;
  operational?: string;
};

const baseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

export async function fetchWallets(): Promise<WalletsResponse> {
  const res = await fetch(`${baseUrl}/api/wallets`);
  if (!res.ok) throw new Error(`Failed to fetch wallets: ${res.status}`);
  return res.json();
}

// Use named exports to avoid default export conflicts
// Service to fetch backend-configured wallets for display
class WalletsService {
  private baseUrl: string;
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
  async fetchWallets() {
    const res = await fetch(`${this.baseUrl}/api/wallets`);
    if (!res.ok) throw new Error(`Failed to fetch wallets: ${res.status}`);
    return res.json() as Promise<{ hot: string; treasury: string; operational: string }>;
  }
}
export default new WalletsService();
