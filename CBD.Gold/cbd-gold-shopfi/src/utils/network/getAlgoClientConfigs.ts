import type { AlgoViteClientConfig, AlgoViteKMDConfig } from '../../interfaces/network'


export function getAlgodConfigFromViteEnvironment(): AlgoViteClientConfig {
  const server = import.meta.env.VITE_ALGOD_SERVER;
  const port = import.meta.env.VITE_ALGOD_PORT;
  const token = import.meta.env.VITE_ALGOD_TOKEN;
  const network = import.meta.env.VITE_ALGOD_NETWORK;
  if (!server || !network) {
    throw new Error('Algod configuration missing required environment variables.');
  }
  if (network.toLowerCase() !== 'testnet') {
    throw new Error('Only Algorand TestNet is supported. Please set VITE_ALGOD_NETWORK=testnet');
  }
  return { server, port, token, network };
}


export function getIndexerConfigFromViteEnvironment(): AlgoViteClientConfig {
  const server = import.meta.env.VITE_INDEXER_SERVER;
  const port = import.meta.env.VITE_INDEXER_PORT;
  const token = import.meta.env.VITE_INDEXER_TOKEN;
  const network = import.meta.env.VITE_ALGOD_NETWORK;
  if (!server || !network) {
    throw new Error('Indexer configuration missing required environment variables.');
  }
  if (network.toLowerCase() !== 'testnet') {
    throw new Error('Only Algorand TestNet is supported. Please set VITE_ALGOD_NETWORK=testnet');
  }
  return { server, port, token, network };
}


export function getKmdConfigFromViteEnvironment(): AlgoViteKMDConfig {
  const server = import.meta.env.VITE_KMD_SERVER;
  const port = import.meta.env.VITE_KMD_PORT;
  const token = import.meta.env.VITE_KMD_TOKEN;
  const wallet = import.meta.env.VITE_KMD_WALLET;
  const password = import.meta.env.VITE_KMD_PASSWORD;
  const network = import.meta.env.VITE_ALGOD_NETWORK;
  if (!server || !wallet || !network) {
    throw new Error('KMD configuration missing required environment variables.');
  }
  if (network.toLowerCase() !== 'testnet') {
    throw new Error('Only Algorand TestNet is supported. Please set VITE_ALGOD_NETWORK=testnet');
  }
  return { server, port, token, wallet, password };
}
