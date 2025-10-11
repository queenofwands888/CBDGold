import algosdk, { type TransactionSigner } from 'algosdk';
import { chainConfig } from './env';
import { getAlgorandClient, getPrizeClient } from './contractClients';

export async function claimPrizeOnChain(account: string, signer: TransactionSigner, amount: number) {
  if (!chainConfig.prizeAppId) throw new Error('Missing prize app id');
  if (amount <= 0) throw new Error('Prize amount must be positive');

  const prizeClient = getPrizeClient({ sender: account, signer });
  const claimCall = await prizeClient.appClient.params.call({
    method: 'claim_prize',
    sender: account,
    signer,
    args: [BigInt(Math.floor(amount))],
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });

  const composer = getAlgorandClient({ sender: account, signer }).newGroup();
  composer.addAppCallMethodCall(claimCall);

  const result = await composer.send();
  return { txId: result.txIds[result.txIds.length - 1] };
}
