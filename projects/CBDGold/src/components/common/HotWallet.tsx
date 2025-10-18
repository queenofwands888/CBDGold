import React, { useEffect, useMemo, useState } from 'react';
import { fetchWallets } from '../../services/walletsService';
import { logger } from '../../utils/logger';

// Lightweight QR generator using data URL (avoids React type conflicts)
async function toQrDataUrl(text: string): Promise<string> {
    const { default: QR } = await import('qrcode');
    return QR.toDataURL(text, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 192,
        color: { dark: '#FF3333', light: '#00000000' }
    });
}

const DEFAULT_FALLBACK = 'GFLK62N2S7EERTGITVJAEQZRRYOMVXBRCKA7H72PRYXNIIRV3NL53I7BBU';

const HotWallet: React.FC = () => {
    const { VITE_HOT_WALLET, VITE_HOT_WALLET_ADDRESS } = import.meta.env;
    const envFallback = VITE_HOT_WALLET || VITE_HOT_WALLET_ADDRESS;
    const fallback = useMemo(() => envFallback || DEFAULT_FALLBACK, [envFallback]);
    const [address, setAddress] = useState<string>('');
    const [qr, setQr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchWallets();
                const addr = data?.hot || fallback;
                if (cancelled) return;
                setAddress(addr);
                const url = await toQrDataUrl(addr);
                if (!cancelled) setQr(url);
            } catch (error) {
                logger.warn('Wallet API unavailable, using HOT fallback', error);
                if (cancelled) return;
                setAddress(fallback);
                const url = await toQrDataUrl(fallback);
                if (!cancelled) setQr(url);
            }
        })();
        return () => { cancelled = true; };
    }, [fallback]);

    return (
        <div className="mt-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <p className="text-xs text-red-300 mb-2 text-center font-semibold">CBDGold HOT Wallet (Supplier Restock)</p>
            <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-xs text-red-200 break-all select-all bg-black/20 rounded-lg px-2 py-1">{address || 'Loading...'}</span>
                <button
                    className="btn-secondary text-xs"
                    onClick={() => address && navigator.clipboard.writeText(address)}
                    disabled={!address}
                >Copy Address</button>
                {qr ? <img src={qr} alt="HOT Wallet QR" className="w-24 h-24" /> : <div className="w-24 h-24 bg-black/20 rounded" />}
            </div>
        </div>
    );
};

export default HotWallet;
