import algosdk, { type TransactionSigner } from 'algosdk';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { chainConfig } from './env';
import { CbdGoldStakingClient } from '../contracts/CBDGoldStaking';
import { CbdGoldPrizeClient } from '../contracts/CBDGoldPrize';
import { CbdGoldGovernanceClient } from '../contracts/CBDGoldGovernance';

const algodServer = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const algodToken = import.meta.env.VITE_ALGOD_TOKEN || '';
const algodPort = import.meta.env.VITE_ALGOD_PORT || '';

let cachedAlgorandClient: AlgorandClient | undefined;

function getOrCreateAlgorandClient(): AlgorandClient {
  if (!cachedAlgorandClient) {
    const algod = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    cachedAlgorandClient = AlgorandClient.fromClients({ algod });
  }
  return cachedAlgorandClient;
}

type ClientOptions = {
  sender?: string;
  signer?: TransactionSigner;
};

function configureSigner({ sender, signer }: ClientOptions, client: AlgorandClient) {
  if (sender && signer) {
    client.setSigner(sender, signer);
  }
}

export function getStakingClient(options: ClientOptions = {}) {
  if (!chainConfig.stakingAppId) throw new Error('Missing staking app id');
  const algorand = getOrCreateAlgorandClient();
  configureSigner(options, algorand);
  return new CbdGoldStakingClient({
    appId: BigInt(chainConfig.stakingAppId),
    algorand,
    defaultSender: options.sender,
  });
}

export function getPrizeClient(options: ClientOptions = {}) {
  if (!chainConfig.prizeAppId) throw new Error('Missing prize app id');
  const algorand = getOrCreateAlgorandClient();
  configureSigner(options, algorand);
  return new CbdGoldPrizeClient({
    appId: BigInt(chainConfig.prizeAppId),
    algorand,
    defaultSender: options.sender,
  });
}

export function getGovernanceClient(options: ClientOptions = {}) {
  if (!chainConfig.governanceAppId) throw new Error('Missing governance app id');
  const algorand = getOrCreateAlgorandClient();
  configureSigner(options, algorand);
  return new CbdGoldGovernanceClient({
    appId: BigInt(chainConfig.governanceAppId),
    algorand,
    defaultSender: options.sender,
  });
}

export function getAlgorandClient(options: ClientOptions = {}) {
  const algorand = getOrCreateAlgorandClient();
  configureSigner(options, algorand);
  return algorand;
}
