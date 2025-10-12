import React, { useMemo, useState } from 'react';
import algosdk from 'algosdk';
import { useSnackbar } from 'notistack';
import { getAlgodClient } from '../../onchain/algodClient';
import { useWalletManager } from '../../hooks/useWalletManager';
import { chainConfig } from '../../onchain/env';

const isProviderAvailable = () => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.algorand?.signTxns || w.algorand?.signTransactions || w.myAlgoConnect?.signTransactions);
};

const TestnetTools: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { connected, address, signTransactions } = useWalletManager();
  const [sending, setSending] = useState(false);

  const network = (chainConfig.network || '').toLowerCase() || 'testnet';
  const algodServer = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud';

  const onTestnet = useMemo(() => network.includes('test'), [network]);
  const providerReady = useMemo(() => isProviderAvailable(), []);
  const isRealAddress = useMemo(() => !!address && !address?.startsWith('FAKE-'), [address]);

  const decodeSignedBlob = (blob: string | Uint8Array): Uint8Array => {
    if (typeof blob !== 'string') return new Uint8Array(blob);
    if (typeof atob === 'function') {
      const bin = atob(blob);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    throw new Error('Unable to decode signed blob');
  };

  const sendSelfPayment = async () => {
    if (!connected || !isRealAddress) {
      enqueueSnackbar('Connect a real wallet first', { variant: 'warning' });
      return;
    }
    try {
      setSending(true);
      const algod = getAlgodClient();
      const params = await algod.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: address!,
        to: address!,
        amount: 100_000,
        suggestedParams: params as any,
      } as any);

      let signedBlob: Uint8Array | undefined;
      try {
        // Try via our adapter first (on-chain mode)
        const [signed] = await signTransactions([txn]);
        signedBlob = signed;
      } catch {
        // Fallback: call provider directly if available
        const w: any = window as any;
        const provider = w.algorand || w.myAlgoConnect;
        if (!provider) throw new Error('No wallet provider available to sign');
        const encoded = txn.toByte();
        const res: any = provider.signTxns
          ? await provider.signTxns([encoded])
          : await provider.signTransactions([encoded]);
        signedBlob = decodeSignedBlob(res[0]);
      }

      const sendRes: any = await algod.sendRawTransaction(signedBlob!).do();
      const txId: string = (sendRes && (sendRes.txId || sendRes.txid || sendRes['txId'] || sendRes['txid'])) as string;
      await algosdk.waitForConfirmation(algod, txId, 4);
      enqueueSnackbar(`Self-payment confirmed: ${txId.slice(0, 10)}…`, { variant: 'success' });
    } catch (e: any) {
      enqueueSnackbar(`Send failed: ${e?.message || 'error'}`, { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">Network</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${onTestnet ? 'bg-green-500/15 text-green-300 border-green-500/30' : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'}`}>
          {onTestnet ? 'TestNet' : (network || 'Unknown')}
        </span>
      </div>
      <div className="text-xs text-gray-400 break-all">{algodServer}</div>
      <div className="h-px bg-white/10" />
      <div className="space-y-2">
        <button
          className="w-full btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!providerReady || !connected || !isRealAddress || sending}
          onClick={sendSelfPayment}
        >
          {sending ? 'Sending…' : 'Send 0.1 Test ALGO to myself'}
        </button>
        {!providerReady && (
          <p className="text-[11px] text-yellow-300/90">No signing provider detected. Install a wallet extension (e.g., Pera) and switch it to TestNet.</p>
        )}
      </div>
    </div>
  );
};

export default TestnetTools;
