// import algosdk from 'algosdk';
// import { chainConfig } from './env';

export interface StakingGlobalState {
  totalStaked: number;
  rewardPool: number;
}

export interface StakingLocalState {
  staked: number;
  rewards: number;
}

export async function fetchStakingGlobalState(): Promise<StakingGlobalState> {
  // Simulate fetch from Algorand smart contract
  // Replace with real contract call
  return {
    totalStaked: 1000000,
    rewardPool: 50000
  };
}

export async function fetchStakingLocalState(_address: string): Promise<StakingLocalState> {
  // Simulate fetch from Algorand smart contract
  // Replace with real contract call
  return {
    staked: 1000,
    rewards: 50
  };
}
