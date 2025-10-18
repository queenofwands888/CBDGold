import React from 'react';
import { useAppContext } from '../../contexts';
import ClaimPrizeButton from '../common/ClaimPrizeButton';
import WalletModal from '../common/WalletModal';
import ChainModeBadge from '../common/ChainModeBadge';
import logo from '../../assets/cbdgold-logo.png';

const Header: React.FC = () => {
  const { state } = useAppContext();
  const { walletConnected } = state;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-amber-400/25" />
            <img src={logo} alt="CBD Gold Logo" className="relative h-12 w-12" style={{ filter: 'drop-shadow(0 0 14px rgba(251, 191, 36, 0.55))' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold gradient-text tracking-tight">CBD Gold ShopFi</span>
            <span className="text-xs uppercase text-amber-200/80 tracking-[0.3em]">Hemp • Commerce • Algorand</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClaimPrizeButton />
          <ChainModeBadge />
          <button
            onClick={walletConnected ? () => setIsModalOpen(true) : () => setIsModalOpen(true)}
            className={`bg-gradient-to-r px-6 py-2 rounded-full font-semibold transition-all ${walletConnected ? 'from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700' : 'from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-500'} `}
          >
            {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </button>
        </div>
      </header>
      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;
