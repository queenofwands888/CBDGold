import algosdk, { type TransactionSigner } from 'algosdk';
import { chainConfig } from './env';
import { getAlgorandClient, getStakingClient } from './contractClients';

export interface OnChainResult { txId: string; }
export interface StakingLocalState { staked: number; tier: number; pending: number; }
export interface StakingGlobalState { totalStaked: number; rewardRate: number; assetId?: number; }

export async function stakeHempOnChain(account: string, signer: TransactionSigner, amount: number): Promise<OnChainResult> {
  if (!chainConfig.stakingAppId || !chainConfig.hempAsaId) throw new Error('Missing staking app or ASA id');
  if (amount <= 0) throw new Error('Stake amount must be positive');

  const amountUint = BigInt(Math.floor(amount));
  const stakingClient = getStakingClient({ sender: account, signer });
  const algorand = getAlgorandClient({ sender: account, signer });

  const composer = algorand.newGroup();
  composer.addAssetTransfer({
    sender: account,
    receiver: stakingClient.appAddress,
    assetId: BigInt(chainConfig.hempAsaId),
    amount: amountUint,
  });

  const stakeCall = await stakingClient.appClient.params.call({
    method: 'stake',
    sender: account,
    signer,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });
  composer.addAppCallMethodCall(stakeCall);

  const result = await composer.send();
  return { txId: result.txIds[result.txIds.length - 1] };
}

export async function unstakeHempOnChain(account: string, signer: TransactionSigner, amount: number): Promise<OnChainResult> {
  if (!chainConfig.stakingAppId) throw new Error('Missing staking app id');
  if (amount <= 0) throw new Error('Unstake amount must be positive');

  const stakingClient = getStakingClient({ sender: account, signer });
  const call = await stakingClient.appClient.params.call({
    method: 'unstake',
    sender: account,
    signer,
    args: [BigInt(Math.floor(amount))],
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });

  const algorand = getAlgorandClient({ sender: account, signer });
  const composer = algorand.newGroup();
  composer.addAppCallMethodCall(call);

  const result = await composer.send();
  return { txId: result.txIds[result.txIds.length - 1] };
}

export async function claimStakingRewardsOnChain(account: string, signer: TransactionSigner) {
  if (!chainConfig.stakingAppId) throw new Error('Missing staking app id');

  const stakingClient = getStakingClient({ sender: account, signer });
  const call = await stakingClient.appClient.params.call({
    method: 'claim',
    sender: account,
    signer,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });

  const algorand = getAlgorandClient({ sender: account, signer });
  const composer = algorand.newGroup();
  composer.addAppCallMethodCall(call);

  const result = await composer.send();
  return { txId: result.txIds[result.txIds.length - 1] };
}

export async function fetchStakingGlobalState(): Promise<StakingGlobalState | undefined> {
  if (!chainConfig.stakingAppId) return undefined;
  const stakingClient = getStakingClient();
  const global = await stakingClient.state.global.getAll();
  return {
    totalStaked: global.totalStaked !== undefined ? Number(global.totalStaked) : 0,
    rewardRate: global.rewardRate !== undefined ? Number(global.rewardRate) : 0,
    assetId: global.assetId !== undefined ? Number(global.assetId) : undefined,
  };
}

export async function fetchStakingLocalState(address: string): Promise<StakingLocalState | undefined> {
  if (!chainConfig.stakingAppId) return undefined;
  try {
    const stakingClient = getStakingClient();
    const local = await stakingClient.state.local(address).getAll();
    return {
      staked: local.stakedAmount !== undefined ? Number(local.stakedAmount) : 0,
      tier: local.tier !== undefined ? Number(local.tier) : 0,
      pending: local.pending !== undefined ? Number(local.pending) : 0,
    };
  } catch (_e) {
    return undefined;
  }
}
