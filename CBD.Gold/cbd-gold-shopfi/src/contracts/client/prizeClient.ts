// Stub for prizeClient
export interface PrizeTxResult {
  txId: string;
}

export const claimPrize = async (): Promise<PrizeTxResult> => {
  await new Promise(res => setTimeout(res, 100));
  return { txId: 'MOCK_PRIZE_TX_' + Math.floor(Math.random() * 1e8) };
};
