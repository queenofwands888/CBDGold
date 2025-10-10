import React, { useState } from 'react';
import { useAppContext } from '../../contexts';
import { useAppTransactions } from '../../hooks/useAppTransactions';
import { useNotify } from '../../hooks/useNotify';

const ClaimPrizeButton: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { claimPrize } = useAppTransactions();
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);

  // Only show if prize is available
  if (!state.hasPrizeToClaim) return null;
  const canClaim = state.walletConnected;

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimPrize();
      dispatch({ type: 'SET_PRIZE_CLAIM_STATUS', payload: false });
      notify('Prize claimed!', 'success');
    } catch (e: any) {
      notify('Prize claim failed: ' + (e.message || 'error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={!canClaim || loading}
      className={`ml-4 px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 shadow-lg border-2 border-yellow-200/60 transition-all ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      title="Claim your prize!"
    >
      {loading ? 'Claiming...' : 'Claim Prize'}
    </button>
  );
};

export default ClaimPrizeButton;
