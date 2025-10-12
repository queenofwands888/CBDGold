import React from 'react';

const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS || '43IB5RMLM2NFOHOPA6NPHNDL53S2AVZ4KUSRDUQP6WEOLTKFYIPK4VXA6A';

const TreasuryWallet: React.FC = () => (
  <div className="mt-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
    <p className="text-xs text-yellow-300 mb-2 text-center font-semibold">CBDGold TestNet Treasury Wallet</p>
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-xs text-yellow-200 break-all select-all bg-black/20 rounded-lg px-2 py-1">{treasuryAddress}</span>
      <button
        className="btn-secondary text-xs"
        onClick={() => navigator.clipboard.writeText(treasuryAddress)}
      >Copy Address</button>
      {/* QR code temporarily disabled for production build stability; re-enable with compatible types */}
    </div>
  </div>
);

export default TreasuryWallet;
