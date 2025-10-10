import algosdk from 'algosdk';
// import { chainConfig } from './env';

// Example: Replace with actual values or env variables as needed
const ALGOD_TOKEN = import.meta.env.VITE_ALGOD_TOKEN || '';
const ALGOD_SERVER = import.meta.env.VITE_ALGOD_SERVER || 'http://localhost';
const ALGOD_PORT = Number(import.meta.env.VITE_ALGOD_PORT) || 4001;

export function getAlgodClient(): algosdk.Algodv2 {
  return new algosdk.Algodv2(
    ALGOD_TOKEN,
    ALGOD_SERVER,
    ALGOD_PORT
  );
}
