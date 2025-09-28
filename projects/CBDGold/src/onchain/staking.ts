import algosdk from 'algosdk';
import { chainConfig } from './env';
import { getAlgodClient } from './algod';

export interface OnChainResult { txId: string; }
export interface StakingLocalState { staked: number; tier: number; pending: number; }
export interface StakingGlobalState { totalStaked: number; rewardRate: number; assetId?: number; }

export async function stakeHempOnChain(account: string, signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>, amount: number): Promise<OnChainResult> {
  if (!chainConfig.stakingAppId || !chainConfig.hempAsaId) throw new Error('Missing staking app or ASA id');
  const algod = getAlgodClient();
  const params = await algod.getTransactionParams().do();
  const appCallParams: any = {
    from: account,
    appIndex: chainConfig.stakingAppId,
    appArgs: [new Uint8Array(Buffer.from('stake'))],
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params
  };
  const assetXferParams: any = {
    from: account,
    to: algosdk.getApplicationAddress(chainConfig.stakingAppId!),
    assetIndex: chainConfig.hempAsaId,
    amount,
    suggestedParams: params
  };
  // Using deprecated helper names for broader compatibility across algosdk minor versions.
  const appCall = algosdk.makeApplicationNoOpTxnFromObject(appCallParams);
  const assetXfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(assetXferParams);
  algosdk.assignGroupID([appCall, assetXfer]);
  const signed = await signer([appCall, assetXfer]);
  const sendRes: any = await algod.sendRawTransaction(signed.map(s => new Uint8Array(s))).do();
  const txId = sendRes.txid || sendRes.txId;
  await algosdk.waitForConfirmation(algod, txId, 4);
  return { txId };
}

export async function unstakeHempOnChain(account: string, signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>, amount: number): Promise<OnChainResult> {
  if (!chainConfig.stakingAppId) throw new Error('Missing staking app id');
  const algod = getAlgodClient();
  const params = await algod.getTransactionParams().do();
  const unstakeParams: any = {
    from: account,
    appIndex: chainConfig.stakingAppId,
    appArgs: [new Uint8Array(Buffer.from('unstake')), algosdk.encodeUint64(amount)],
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params
  };
  const appCall = algosdk.makeApplicationCallTxnFromObject(unstakeParams);
  const signed = await signer([appCall]);
  const sendRes: any = await algod.sendRawTransaction(signed.map(s => new Uint8Array(s))).do();
  const txId = sendRes.txid || sendRes.txId;
  await algosdk.waitForConfirmation(algod, txId, 4);
  return { txId };
}

export async function claimStakingRewardsOnChain(account: string, signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>) {
  if (!chainConfig.stakingAppId) throw new Error('Missing staking app id');
  const algod = getAlgodClient();
  const params = await algod.getTransactionParams().do();
  const claimParams: any = {
    from: account,
    appIndex: chainConfig.stakingAppId,
    appArgs: [new Uint8Array(Buffer.from('claim'))],
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params
  };
  const appCall = algosdk.makeApplicationCallTxnFromObject(claimParams);
  const signed = await signer([appCall]);
  const sendRes: any = await algod.sendRawTransaction(signed.map(s => new Uint8Array(s))).do();
  const txId = sendRes.txid || sendRes.txId;
  await algosdk.waitForConfirmation(algod, txId, 4);
  return { txId };
}

export async function fetchStakingGlobalState(): Promise<StakingGlobalState | undefined> {
  if (!chainConfig.stakingAppId) return;
  const algod = getAlgodClient();
  const app = await algod.getApplicationByID(chainConfig.stakingAppId).do();
  // Depending on algosdk version, global state may appear as global-state (raw) or globalState (typed) -> use fallback
  const rawGs: any = (app.params as any)['global-state'] || (app.params as any).globalState || [];
  const gs: any[] = rawGs;
  const decodeKey = (b64: string) => Buffer.from(b64, 'base64').toString();
  const map: Record<string, number> = {};
  gs.forEach((kv: any) => { const k = decodeKey(kv.key); map[k] = kv.value?.uint ?? 0; });
  return {
    totalStaked: map['total_staked'] || 0,
    rewardRate: map['reward_rate'] || 0,
    assetId: map['asset_id']
  };
}

export async function fetchStakingLocalState(address: string): Promise<StakingLocalState | undefined> {
  if (!chainConfig.stakingAppId) return;
  const algod = getAlgodClient();
  const acct = await algod.accountApplicationInformation(address, chainConfig.stakingAppId).do();
  const rawLsContainer: any = (acct as any)['app-local-state'] || (acct as any).appLocalState || {};
  const ls: any[] = rawLsContainer['key-value'] || rawLsContainer.keyValue || [];
  const decodeKey = (b64: string) => Buffer.from(b64, 'base64').toString();
  const map: Record<string, number> = {};
  ls.forEach((kv: any) => { const k = decodeKey(kv.key); map[k] = kv.value?.uint ?? 0; });
  return {
    staked: map['staked_amount'] || 0,
    tier: map['tier'] || 0,
    pending: map['pending'] || 0
  };
}
