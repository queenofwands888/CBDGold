import React from 'react';
import { useAppContext } from '../../contexts';
import ClaimPrizeButton from '../common/ClaimPrizeButton';
import WalletModal from '../common/WalletModal';
import logo from '../../assets/logo.svg';

const Header: React.FC = () => {
  const { state } = useAppContext();
  const { walletConnected } = state;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-brand-emerald/20" />
            <img src={logo} alt="CBD Gold Logo" className="relative h-12 w-12" style={{ filter: 'drop-shadow(0 0 14px rgba(52, 211, 153, 0.45))' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold gradient-text tracking-tight">CBD Gold ShopFi</span>
            <span className="text-xs uppercase text-gray-400 tracking-[0.3em]">Hemp • Commerce • Algorand</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClaimPrizeButton />
          <button
            onClick={walletConnected ? () => setIsModalOpen(true) : () => setIsModalOpen(true)}
            className={`bg-gradient-to-r px-6 py-2 rounded-full font-semibold transition-all ${walletConnected ? 'from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700' : 'from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'} `}
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
