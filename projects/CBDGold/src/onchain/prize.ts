import algosdk from 'algosdk';
import { chainConfig } from './env';
import { getAlgodClient } from './algod';

export async function claimPrizeOnChain(account: string, signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>, amount: number) {
  if (!chainConfig.prizeAppId) throw new Error('Missing prize app id');
  const algod = getAlgodClient();
  const params = await algod.getTransactionParams().do();
  const appArgs = [new Uint8Array(Buffer.from('claim_prize')), algosdk.encodeUint64(amount)];
  const txParams: any = {
    from: account,
    appIndex: chainConfig.prizeAppId,
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
