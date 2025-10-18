import React, { useState } from 'react';
import { ScopeType, type SignMetadata } from '@txnlab/use-wallet';
import { useWallet } from '@txnlab/use-wallet-react';
import { claimPrize as claimPrizeContract, PrizeTxResult } from '../contracts/client/prizeClient';
import { logger } from '../utils/logger';
import { sanitizeText, isValidAlgorandAddress } from '../utils/validation';

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

  type SignatureValue = Uint8Array | string | null | undefined;

  const toBase64 = (input: SignatureValue): string | null => {
    if (!input) return null;
    if (typeof input === 'string') return input;
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input).toString('base64');
    }
    let binary = '';
    input.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  };

  interface SignatureObject {
    signature?: SignatureValue;
    sig?: SignatureValue;
  }

  type SignResponse = SignatureValue | SignatureObject | Array<SignatureValue | SignatureObject>;

  const extractSignature = (response: SignResponse): string | null => {
    const resolveValue = (value: SignatureValue | SignatureObject): SignatureValue => {
      if (value && typeof value === 'object' && !('length' in value)) {
        const obj = value as SignatureObject;
        return obj.signature ?? obj.sig ?? null;
      }
      return value as SignatureValue;
    };

    if (Array.isArray(response)) {
      const [first] = response;
      return toBase64(resolveValue(first ?? null));
    }

    return toBase64(resolveValue(response));
  };

  const handleClaim = async () => {
    const sanitizedAddress = sanitizeText(address, 300);

    if (!sanitizedAddress) {
      setStatus('Please enter your shipping address.');
      return;
    }

    if (sanitizedAddress.length < 10) {
      setStatus('Shipping address must be at least 10 characters long.');
      return;
    }

    if (!isValidAlgorandAddress(userAddress)) {
      setStatus('Connected wallet address is invalid.');
      return;
    }

    if (!wallet.activeAddress) {
      setStatus('Please connect a wallet capable of signing messages.');
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
      const message = `I claim my prize ${prizeId} for shipping to: ${sanitizedAddress}`;
      let signedMsg: string | null = null;

      if (wallet.signData) {
        try {
          const metadata: SignMetadata = {
            scope: ScopeType.AUTH,
            encoding: 'utf8'
          };
          const signResponse = await wallet.signData(message, metadata);
          signedMsg = extractSignature(signResponse as SignResponse);
        } catch (err) {
          logger.error('Failed to sign prize claim message', err);
          throw new Error('Wallet declined to sign the prize claim message.');
        }
      }

      if (!signedMsg) {
        throw new Error('Active wallet does not support message signing.');
      }

      const res = await fetch('/api/claim-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: userAddress,
          prizeId,
          shippingAddress: sanitizedAddress,
          signature: signedMsg
        })
      });
      const data = (await res.json()) as { qrCode?: string; error?: string };
      if (res.ok && data.qrCode) {
        setStatus('Claim submitted! Show this QR code to Royal Mail for dispatch.');
        setQrCode(data.qrCode);
        if (onClaimed) onClaimed();
      } else {
        setStatus(data.error || 'Claim failed. Please try again.');
        if (typeof onTxStatus === 'function') onTxStatus('failed', tx.txId, data.error);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        logger.error('Prize claim submission failed', e);
        setStatus('Error submitting claim.');
        if (typeof onTxStatus === 'function') onTxStatus('failed', undefined, e.message);
      } else {
        logger.error('Prize claim submission failed', e);
        setStatus('Error submitting claim.');
        if (typeof onTxStatus === 'function') onTxStatus('failed', undefined, 'Unknown error submitting claim');
      }
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
            onChange={e => setAddress(sanitizeText(e.target.value, 300))}
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
