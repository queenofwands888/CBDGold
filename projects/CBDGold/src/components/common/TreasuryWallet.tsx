import React, { useEffect, useMemo, useState } from 'react';
import walletsService from '../../services/walletsService';

// Lazy QR generator
async function toQrDataUrl(text: string): Promise<string> {
  const { default: QR } = await import('qrcode');
  return QR.toDataURL(text, { errorCorrectionLevel: 'M', margin: 1, width: 192, color: { dark: '#FFD700', light: '#00000000' } });
}

const TreasuryWallet: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [qr, setQr] = useState<string>('');
  const fallback = useMemo(() => import.meta.env.VITE_TREASURY_ADDRESS || '43IB5RMLM2NFOHOPA6NPHNDL53S2AVZ4KUSRDUQP6WEOLTKFYIPK4VXA6A', []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await walletsService.fetchWallets();
        const addr = data.treasury || fallback;
        if (cancelled) return;
        setAddress(addr);
        const url = await toQrDataUrl(addr);
        if (!cancelled) setQr(url);
      } catch {
        setAddress(fallback);
        const url = await toQrDataUrl(fallback);
        if (!cancelled) setQr(url);
      }
    })();
    return () => { cancelled = true; };
  }, [fallback]);

  return (
    <div className="mt-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
      <p className="text-xs text-yellow-300 mb-2 text-center font-semibold">CBDGold TestNet Treasury Wallet</p>
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-xs text-yellow-200 break-all select-all bg-black/20 rounded-lg px-2 py-1">{address || 'Loading...'}</span>
        <button
          className="btn-secondary text-xs"
          onClick={() => address && navigator.clipboard.writeText(address)}
          disabled={!address}
        >Copy Address</button>
        {qr ? <img src={qr} alt="Treasury Wallet QR" className="w-24 h-24" /> : <div className="w-24 h-24 bg-black/20 rounded" />}
      </div>
    </div>
  );
};

export default TreasuryWallet;
