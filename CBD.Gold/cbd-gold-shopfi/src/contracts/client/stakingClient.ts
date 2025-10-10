// Stub for stakingClient
export interface TxResult {
  txId: string;
}

export const stakeHemp = async (): Promise<TxResult> => {
  await new Promise(res => setTimeout(res, 100));
  return { txId: 'MOCK_TX_ID_' + Math.floor(Math.random() * 1e8) };
};
