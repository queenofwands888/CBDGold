import React, { useEffect, useMemo, useState } from 'react';
import { fetchWallets } from '../../services/walletsService';
import { chainConfig } from '../../onchain/env';
import { getNetworkLabel, isTestNet } from '../../onchain/network';

type WalletKind = 'treasury' | 'operational' | 'hot';

type WalletDescriptor = {
  key: WalletKind;
  label: string;
  subtitle: string;
  accent: string;
  qrColor: string;
  fallback: string;
};

type WalletEntry = {
  key: WalletKind;
  label: string;
  subtitle: string;
  accent: string;
  qrColor: string;
  address: string;
  qr?: string;
};

const DESCRIPTORS: WalletDescriptor[] = [
  {
    key: 'treasury',
    label: 'Treasury Wallet',
    subtitle: 'Inventory & Loyalty Rewards',
    accent: 'from-amber-400 to-yellow-400',
    qrColor: '#fbbf24',
    fallback: '43IB5RMLM2NFOHOPA6NPHNDL53S2AVZ4KUSRDUQP6WEOLTKFYIPK4VXA6A',
  },
  {
    key: 'operational',
    label: 'Operations Wallet',
    subtitle: 'Retail Settlements & CX',
    accent: 'from-emerald-400 to-green-500',
    qrColor: '#34d399',
    fallback: '',
  },
  {
    key: 'hot',
    label: 'Hot Wallet',
    subtitle: 'Supplier Restock Liquidity',
    accent: 'from-rose-500 to-red-500',
    qrColor: '#fb7185',
    fallback: 'GFLK62N2S7EERTGITVJAEQZRRYOMVXBRCKA7H72PRYXNIIRV3NL53I7BBU',
  },
];

async function toQrDataUrl(text: string, color: string): Promise<string> {
  const { default: QR } = await import('qrcode');
  return QR.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 192,
    color: { dark: color, light: '#00000000' },
  });
}

const BrandWalletDirectory: React.FC = () => {
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const networkLabel = useMemo(() => {
    if (chainConfig.mode !== 'onchain') return 'Simulation';
    return getNetworkLabel();
  }, []);
  const warnTestNet = useMemo(() => chainConfig.mode === 'onchain' && isTestNet(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchWallets();
        const hydrated: WalletEntry[] = [];
        for (const descriptor of DESCRIPTORS) {
          const raw = (data as Record<string, string | undefined>)[descriptor.key];
          const address = (raw && raw.trim()) || descriptor.fallback;
          if (!address || address.length < 6) continue;
          const qr = await toQrDataUrl(address, descriptor.qrColor);
          if (cancelled) return;
          hydrated.push({ ...descriptor, address, qr });
        }
        if (!cancelled) setEntries(hydrated);
      } catch {
        if (!cancelled) {
          setEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && entries.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4">
        <p className="text-xs text-gray-400">Fetching CBD Gold wallet directory…</p>
      </div>
    );
  }

  if (!entries.length) return null;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">CBD Gold Wallets</h3>
          <p className="text-[11px] text-gray-400">Network: {networkLabel}</p>
        </div>
        <span className="text-[10px] text-gray-500">Scan &amp; send with confidence</span>
      </div>
      {warnTestNet && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
          TestNet addresses only — never send MainNet funds.
        </div>
      )}
      <div className="space-y-3">
        {entries.map(entry => {
          const canCopy = typeof navigator !== 'undefined' && navigator.clipboard;
          const copyAddress = () => {
            if (!canCopy) return;
            navigator.clipboard.writeText(entry.address).catch(() => {/* ignore */});
          };

          return (
            <div key={entry.key} className="bg-black/20 border border-white/10 rounded-lg p-3 flex items-center gap-3">
              <div className={`hidden sm:block w-1 self-stretch rounded-full bg-gradient-to-b ${entry.accent}`} aria-hidden />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-200">{entry.label}</p>
                  <p className="text-[11px] text-gray-500">{entry.subtitle}</p>
                </div>
                <div className="bg-black/40 rounded-md px-2 py-1">
                  <p className="font-mono text-[11px] text-gray-200 break-all">{entry.address}</p>
                </div>
                <button
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600 transition-colors"
                  onClick={copyAddress}
                  disabled={!canCopy}
                  type="button"
                >
                  {canCopy ? 'Copy Address' : 'Copy Unavailable'}
                </button>
              </div>
              {entry.qr ? (
                <img src={entry.qr} alt={`${entry.label} QR`} className="w-20 h-20 rounded-md border border-white/10" />
              ) : (
                <div className="w-20 h-20 rounded-md bg-black/40 border border-white/10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrandWalletDirectory;
