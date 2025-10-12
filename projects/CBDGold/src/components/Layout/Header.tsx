import React from 'react';
import { useAppContext } from '../../contexts';
import FeatherIcon from '../FeatherIcon';
import ClaimPrizeButton from '../common/ClaimPrizeButton';
import { useWalletManager } from '../../hooks/useWalletManager';
import WalletModal from '../common/WalletModal';

const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { walletConnected, walletAddress, accountAssets } = state;
  const { connect, disconnect, address, assets } = useWalletManager();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/CBD%20Logo%20-%20PNG%20File%20-%20Black%20Background%20-%2072dpi%20-%20Web%20Use.png" alt="CBD Gold Logo" className="h-10 w-10 rounded-full" />
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
