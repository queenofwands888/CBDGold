import React from 'react';
import QRCode from 'qrcode.react';

const hotWalletAddress = import.meta.env.VITE_HOT_WALLET_ADDRESS || 'GFLK62N2S7EERTGITVJAEQZRRYOMVXBRCKA7H72PRYXNIIRV3NL53I7BBU';

const HotWallet: React.FC = () => (
  <div className="mt-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10">
    <p className="text-xs text-red-300 mb-2 text-center font-semibold">CBDGold HOT Wallet (Supplier Restock)</p>
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-xs text-red-200 break-all select-all bg-black/20 rounded-lg px-2 py-1">{hotWalletAddress}</span>
      <button
        className="btn-secondary text-xs"
        onClick={() => navigator.clipboard.writeText(hotWalletAddress)}
      >Copy Address</button>
      <QRCode value={hotWalletAddress} size={96} bgColor="#00000000" fgColor="#FF3333" />
    </div>
  </div>
);

export default HotWallet;
