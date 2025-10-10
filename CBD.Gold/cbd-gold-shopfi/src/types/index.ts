// Shared type definitions

export interface AccountAssets {
  algo: number;
  hemp: number;
  weed: number;
  usdc: number;
}

export interface TxHistoryItem {
  id: string;
  type: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: number;
  note?: string;
  amount?: number;
  label?: string;
  txId?: string;
}

export * from './vape';
