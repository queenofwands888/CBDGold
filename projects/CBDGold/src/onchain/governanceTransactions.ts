import algosdk, { type TransactionSigner } from 'algosdk';
import { chainConfig } from './env';
import { getAlgorandClient, getGovernanceClient } from './contractClients';

export async function voteOnChain(account: string, signer: TransactionSigner, proposalId: number, support: boolean) {
  if (!chainConfig.governanceAppId) throw new Error('Missing governance app id');
  if (proposalId < 0) throw new Error('Invalid proposal id');

  const governanceClient = getGovernanceClient({ sender: account, signer });
  const voteCall = await governanceClient.appClient.params.call({
    method: 'vote',
    sender: account,
    signer,
    args: [BigInt(Math.floor(proposalId)), BigInt(support ? 1 : 0)],
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });

  const composer = getAlgorandClient({ sender: account, signer }).newGroup();
  composer.addAppCallMethodCall(voteCall);

  const result = await composer.send();
  return { txId: result.txIds[result.txIds.length - 1] };
}
