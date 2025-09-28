import React, { useEffect } from 'react';
import { useAppContext } from '../../contexts';
import { GOVERNANCE_PROPOSALS } from '../../data/constants';
import FeatherIcon from '../FeatherIcon';
import { useNotify } from '../../hooks/useNotify';
import { useAppTransactions } from '../../hooks/useAppTransactions';

const GovernancePanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { notify } = useNotify();
  const { governance, accountAssets } = state;
  const { voteProposal } = useAppTransactions();

  // Initialize proposals once
  useEffect(() => {
    if (!governance.proposals.length) {
      dispatch({ type: 'SET_GOVERNANCE_PROPOSALS', payload: GOVERNANCE_PROPOSALS });
    }
  }, [governance.proposals.length, dispatch]);

  const vote = (id: number) => {
    const proposal = governance.proposals.find(p => p.id === id);
    if (!proposal) return;
    if (accountAssets.weed < proposal.weedRequired) { notify(`Need ${proposal.weedRequired} WEED to vote`, 'error'); return; }
    voteProposal(id, proposal.weedRequired, proposal.title);
    notify(`Submitting vote: ${proposal.title}`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center"><FeatherIcon icon="users" className="mr-2 text-purple-400" />Active Proposals</h3>
          <span className="text-sm text-purple-400">Voting Power: {Math.floor(accountAssets.weed / 0.001).toLocaleString()}</span>
        </div>
        <div className="space-y-4">
          {governance.proposals.map(p => (
            <div key={p.id} className="glass-card rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white">{p.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>{p.status}</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{p.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">{p.timeLeft} left</span>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">{p.weedRequired} WEED to vote</span>
                  <span className="text-gray-500">Votes: {(p.votes || 0)}</span>
                  <button
                    onClick={() => vote(p.id)}
                    disabled={accountAssets.weed < p.weedRequired}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${accountAssets.weed >= p.weedRequired ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                  >
                    Vote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernancePanel;
