// import algosdk from 'algosdk';

export interface PrizeWinner {
  address: string;
  amount: number;
}

export interface PrizeInfo {
  prizePool: number;
  nextDraw: string;
  winners: PrizeWinner[];
}

export async function fetchPrizeInfo(): Promise<PrizeInfo> {
  // Simulate fetch from Algorand prize contract
  // Replace with real contract call
  return {
    prizePool: 10000,
    nextDraw: '2025-01-01T00:00:00Z',
    winners: [
      { address: 'ADDR1', amount: 500 },
      { address: 'ADDR2', amount: 300 }
    ]
  };
}
