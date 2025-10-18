import React, { useState } from 'react';
import FeatherIcon from '../FeatherIcon';
import { GOVERNANCE_PROPOSALS, GovernanceProposal } from '../../data/constants';
import { voteProposal } from '../../contracts/client/governanceClient';

interface GovernanceSectionProps {
  walletConnected: boolean;
  weedBalance: number;
  walletAddress: string;
  onVote: (proposal: GovernanceProposal, weedUsed: number) => void;
  onTxStatus?: (status: 'pending' | 'confirmed' | 'failed', txId?: string, error?: string) => void;
}

const GovernanceSection: React.FC<GovernanceSectionProps> = ({ walletConnected, weedBalance, walletAddress, onVote, onTxStatus }) => {
  const votingPower = Math.floor(weedBalance / 0.01); // 0.01 WEED = 1 Vote
  const [votingPending, setVotingPending] = useState(false);

  const handleVote = async (proposal: GovernanceProposal) => {
    const requiredWeed = proposal.weedRequired * 0.01;
    if (weedBalance < requiredWeed) {
      alert(`You need at least ${requiredWeed} WEED tokens (${proposal.weedRequired} votes) to vote on this proposal`);
      return;
    }
    onTxStatus?.('pending');
    setVotingPending(true);
    try {
      const tx = await voteProposal(walletAddress, proposal.id, requiredWeed);
      onTxStatus?.('confirmed', tx.txId);
      onVote(proposal, requiredWeed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Voting failed';
      onTxStatus?.('failed', undefined, message);
    } finally {
      setVotingPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">WEED Governance</h2>
        <p className="text-gray-300">Participate in platform governance with your WEED tokens</p>
      </div>
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center"><FeatherIcon icon="users" className="mr-2 text-purple-400" /> Active Proposals</h3>
          <span className="text-sm text-purple-400">Voting Power: {votingPower.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {GOVERNANCE_PROPOSALS.map(p => (
            <div key={p.id} className="glass-card rounded-lg p-4 hover:bg-white/15 transition-all">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-white text-lg">{p.title}</h4>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${p.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{p.status}</span>
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{p.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center"><FeatherIcon icon="clock" className="mr-1 w-3 h-3" /><span>{p.timeLeft} left</span></div>
                  <div className="flex items-center"><FeatherIcon icon="leaf" className="mr-1 w-3 h-3 text-purple-400" /><span className="text-purple-400">{p.weedRequired} votes ({(p.weedRequired * 0.01).toFixed(2)} WEED)</span></div>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => handleVote(p)} disabled={votingPending || !walletConnected || weedBalance < (p.weedRequired * 0.01)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${walletConnected && weedBalance >= (p.weedRequired * 0.01) ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}><FeatherIcon icon="check-circle" className="inline mr-2 w-4 h-4" /> Vote Yes</button>
                  <button onClick={() => handleVote(p)} disabled={votingPending || !walletConnected || weedBalance < (p.weedRequired * 0.01)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${walletConnected && weedBalance >= (p.weedRequired * 0.01) ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}><FeatherIcon icon="x-circle" className="inline mr-2 w-4 h-4" /> Vote No</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 text-center"><div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"><FeatherIcon icon="users" className="text-white w-8 h-8" /></div><h3 className="font-bold text-white text-xl mb-2">Your WEED Balance</h3><p className="text-3xl font-bold text-purple-400 mb-2">{walletConnected ? weedBalance.toLocaleString() : '0'}</p><p className="text-xs text-gray-400">Governance tokens</p></div>
        <div className="glass-card rounded-2xl p-6 text-center"><div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center"><FeatherIcon icon="trending-up" className="text-white w-8 h-8" /></div><h3 className="font-bold text-white text-xl mb-2">Voting Power</h3><p className="text-3xl font-bold text-green-400 mb-2">{walletConnected ? votingPower.toLocaleString() : '0'}</p><p className="text-xs text-gray-400">1 WEED = 1,000 votes</p></div>
        <div className="glass-card rounded-2xl p-6 text-center"><div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center"><FeatherIcon icon="activity" className="text-white w-8 h-8" /></div><h3 className="font-bold text-white text-xl mb-2">Active Proposals</h3><p className="text-3xl font-bold text-yellow-400 mb-2">{GOVERNANCE_PROPOSALS.filter(p => p.status === 'Active').length}</p><p className="text-xs text-gray-400">Community decisions</p></div>
      </div>
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center"><FeatherIcon icon="info" className="mr-2 text-blue-400" /> How Governance Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><h4 className="font-semibold text-green-400 mb-2">Voting Process</h4><ul className="text-sm text-gray-300 space-y-1"><li>• Hold WEED tokens to participate in governance</li><li>• Each WEED token provides 1,000 voting power</li><li>• Vote on proposals that shape CBD Gold&apos;s future</li><li>• Proposals require minimum WEED thresholds</li></ul></div>
          <div><h4 className="font-semibold text-purple-400 mb-2">Proposal Types</h4><ul className="text-sm text-gray-300 space-y-1"><li>• New product launches and strain additions</li><li>• Market expansion and distribution decisions</li><li>• Community events and airdrop proposals</li><li>• Platform upgrades and feature requests</li></ul></div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceSection;
