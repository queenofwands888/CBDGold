import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { claimPrize as claimPrizeContract, PrizeTxResult } from '../contracts/client/prizeClient';

interface ClaimPrizeProps {
  userAddress: string;
  prizeId: string;
  onClaimed?: () => void;
  onTxStatus?: (status: 'pending' | 'confirmed' | 'failed', txId?: string, error?: string) => void;
}

const ClaimPrize: React.FC<ClaimPrizeProps> = ({ userAddress, prizeId, onClaimed, onTxStatus }) => {
  const wallet = useWallet();
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!address) {
      setStatus('Please enter your shipping address.');
      return;
    }
    setLoading(true);
    setStatus('');
    setQrCode(null);
    if (typeof onTxStatus === 'function') onTxStatus('pending');
    try {
      // Call contract client for prize claim
      const tx: PrizeTxResult = await claimPrizeContract(userAddress, Number(prizeId));
      if (typeof onTxStatus === 'function') onTxStatus('confirmed', tx.txId);
      // Continue with backend for shipping QR code
      const message = `I claim my prize ${prizeId} for shipping to: ${address}`;
      // Fallback: use wallet.transactionSigner if signMessage is not available
      // For development: use a mock signature (base64-encoded message)
      const signedMsg = btoa(message);
      const res = await fetch('/api/claim-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: userAddress,
          prizeId,
          shippingAddress: address,
          signature: signedMsg
        })
      });
      const data = await res.json();
      if (res.ok && data.qrCode) {
        setStatus('Claim submitted! Show this QR code to Royal Mail for dispatch.');
        setQrCode(data.qrCode);
        if (onClaimed) onClaimed();
      } else {
        setStatus(data.error || 'Claim failed. Please try again.');
        if (typeof onTxStatus === 'function') onTxStatus('failed', tx.txId, data.error);
      }
    } catch (e: any) {
      setStatus('Error submitting claim.');
      if (typeof onTxStatus === 'function') onTxStatus('failed', undefined, e?.message || 'Error submitting claim');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h3 className="font-bold mb-2">Claim your prize</h3>
      {qrCode ? (
        <div className="flex flex-col items-center">
          <img src={qrCode} alt="Shipping QR Code" className="my-4 w-48 h-48" />
          <p className="text-center font-semibold">Show this QR code to Royal Mail for dispatch.</p>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Shipping address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="input input-bordered w-full max-w-xs mb-2"
          />
          <button
            className="btn btn-primary w-full max-w-xs"
            onClick={handleClaim}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </>
      )}
      <p className="text-sm mt-2 text-center">{status}</p>
    </div>
  );
};

export default ClaimPrize;
