import algosdk from 'algosdk';
import { chainConfig } from './env';
import { getAlgodClient } from './algod';

export async function voteOnChain(account: string, signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>, proposalId: number, support: boolean) {
  if (!chainConfig.governanceAppId) throw new Error('Missing governance app id');
  const algod = getAlgodClient();
  const params = await algod.getTransactionParams().do();
  const appArgs = [new Uint8Array(Buffer.from('vote')), algosdk.encodeUint64(proposalId), algosdk.encodeUint64(support ? 1 : 0)];
  const txParams: any = {
    from: account,
    appIndex: chainConfig.governanceAppId,
    appArgs,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params
  };
  const tx = algosdk.makeApplicationCallTxnFromObject(txParams);
  const signed = await signer([tx]);
  const sendRes: any = await algod.sendRawTransaction(signed.map(s => new Uint8Array(s))).do();
  const txId = sendRes.txid || sendRes.txId;
  await algosdk.waitForConfirmation(algod, txId, 4);
  return { txId };
}
