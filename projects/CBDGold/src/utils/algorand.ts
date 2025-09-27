import algosdk from 'algosdk';

export const algodClient = new algosdk.Algodv2(
  '', // Insert Algod API token if needed
  'https://testnet-api.algonode.cloud',
  ''
);

// Add utility functions for contract interaction here
