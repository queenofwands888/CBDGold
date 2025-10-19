#!/usr/bin/env node
/**
 * Utility script to generate a fresh Algorand TestNet account.
 *
 * Usage:
 *   node scripts/create_testnet_account.js
 *
 * The script prints the new account address and its 25-word mnemonic.
 */

import algosdk from 'algosdk';

const account = algosdk.generateAccount();
const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

console.log('Generated Algorand account');
console.log('Address:', account.addr);
console.log('\nMnemonic (store securely):');
console.log(mnemonic);
