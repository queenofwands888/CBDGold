// Stub for governanceClient
export interface GovernanceTxResult {
  txId: string;
}

export const voteProposal = async (): Promise<GovernanceTxResult> => {
  await new Promise(res => setTimeout(res, 100));
  return { txId: 'MOCK_GOV_TX_' + Math.floor(Math.random() * 1e8) };
};
