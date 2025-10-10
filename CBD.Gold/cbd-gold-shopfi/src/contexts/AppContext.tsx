import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import { ECON_CONFIG } from '../data/constants';
import type { AccountAssets } from '../types/index';

interface AppState {
  activeTab: string;
  walletConnected: boolean;
  walletAddress: string;
  isConnecting: boolean;
  accountAssets: AccountAssets;
  stakedAmount: number; // atomic HEMP staked (mock)
  spinBonusDiscount: number; // additional discount from spin (percentage)
  lastSpinResult?: string;
  spinBonusExpiresAt?: number; // epoch ms when spin bonus expires
  assetOptIns: {
    hemp: boolean;
    weed: boolean;
    usdc: boolean;
  };
  backendStatus: 'unknown' | 'up' | 'down';
  loadingProducts: boolean;
  hasPrizeToClaim: boolean;
  governance: {
    proposals: Array<{ id: number; title: string; description: string; status: string; timeLeft: string; weedRequired: number; votes?: number }>;
  };
}

type AppAction =
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_WALLET_CONNECTION'; payload: { connected: boolean; address: string } }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_ACCOUNT_ASSETS'; payload: AccountAssets }
  | { type: 'SET_STAKED_AMOUNT'; payload: number }
  | { type: 'SET_ASSET_OPT_INS'; payload: AppState['assetOptIns'] }
  | { type: 'SET_BACKEND_STATUS'; payload: AppState['backendStatus'] }
  | { type: 'SET_LOADING_PRODUCTS'; payload: boolean }
  | { type: 'SET_PRIZE_CLAIM_STATUS'; payload: boolean }
  | { type: 'SET_GOVERNANCE_PROPOSALS'; payload: AppState['governance']['proposals'] }
  | { type: 'VOTE_ON_PROPOSAL'; payload: { id: number; weedSpent: number } }
  | { type: 'SET_SPIN_BONUS'; payload: { discount: number; result: string } }
  | { type: 'CLEAR_SPIN_BONUS' }
  | { type: 'STAKE_HEMP'; payload: { amount: number } }
  | { type: 'UNSTAKE_HEMP'; payload: { amount: number } }
  | { type: 'CLAIM_STAKING_REWARDS'; payload: { reward: number } }
  | { type: 'VOTE_PROPOSAL'; payload: { id: number; weedSpent: number } }
  | { type: 'PURCHASE_WITH_ALGO'; payload: { amountAlgo: number } }
  | { type: 'PURCHASE_WITH_USDC'; payload: { amountUsdc: number } }
  | { type: 'CLAIM_WITH_HEMP'; payload: { hempSpent: number } }
  | { type: 'CREDIT_SPIN_HEMP'; payload: { hempWon: number } }
  | { type: 'RESET_WALLET' };

const initialState: AppState = {
  activeTab: 'dashboard',
  walletConnected: false,
  walletAddress: '',
  isConnecting: false,
  accountAssets: { algo: 0, hemp: 0, weed: 0, usdc: 0 },
  stakedAmount: 0,
  spinBonusDiscount: 0,
  spinBonusExpiresAt: undefined,
  assetOptIns: { hemp: true, weed: true, usdc: true },
  backendStatus: 'unknown',
  loadingProducts: true,
  hasPrizeToClaim: false,
  governance: { proposals: [] }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_WALLET_CONNECTION':
      return { 
        ...state, 
        walletConnected: action.payload.connected,
        walletAddress: action.payload.address,
        isConnecting: false
      };
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'SET_ACCOUNT_ASSETS':
      return { ...state, accountAssets: action.payload };
    case 'SET_STAKED_AMOUNT':
      return { ...state, stakedAmount: action.payload };
    case 'SET_ASSET_OPT_INS':
      return { ...state, assetOptIns: action.payload };
    case 'SET_BACKEND_STATUS':
      return { ...state, backendStatus: action.payload };
    case 'SET_LOADING_PRODUCTS':
      return { ...state, loadingProducts: action.payload };
    case 'SET_PRIZE_CLAIM_STATUS':
      return { ...state, hasPrizeToClaim: action.payload };
    case 'SET_GOVERNANCE_PROPOSALS':
      return { ...state, governance: { ...state.governance, proposals: action.payload } };
    case 'VOTE_ON_PROPOSAL':
      return {
        ...state,
        accountAssets: { ...state.accountAssets, weed: Math.max(0, state.accountAssets.weed - action.payload.weedSpent) },
        governance: {
          proposals: state.governance.proposals.map(p => p.id === action.payload.id ? { ...p, votes: (p.votes || 0) + 1 } : p)
        }
      };
    case 'SET_SPIN_BONUS':
      return { ...state, spinBonusDiscount: action.payload.discount, lastSpinResult: action.payload.result, spinBonusExpiresAt: Date.now() + ECON_CONFIG.SPIN_BONUS_DURATION_MS };
    case 'CLEAR_SPIN_BONUS':
      return { ...state, spinBonusDiscount: 0, spinBonusExpiresAt: undefined };
    case 'STAKE_HEMP': {
      const amt = action.payload.amount;
      return { ...state, accountAssets: { ...state.accountAssets, hemp: Math.max(0, state.accountAssets.hemp - amt) }, stakedAmount: state.stakedAmount + amt };
    }
    case 'UNSTAKE_HEMP': {
      const amt = action.payload.amount;
      return { ...state, stakedAmount: Math.max(0, state.stakedAmount - amt), accountAssets: { ...state.accountAssets, hemp: state.accountAssets.hemp + amt } };
    }
    case 'CLAIM_STAKING_REWARDS': {
      const r = action.payload.reward;
      return { ...state, accountAssets: { ...state.accountAssets, hemp: state.accountAssets.hemp + r } };
    }
    case 'VOTE_PROPOSAL': {
      return {
        ...state,
        accountAssets: { ...state.accountAssets, weed: Math.max(0, state.accountAssets.weed - action.payload.weedSpent) },
        governance: {
          proposals: state.governance.proposals.map(p => p.id === action.payload.id ? { ...p, votes: (p.votes || 0) + 1 } : p)
        }
      };
    }
    case 'PURCHASE_WITH_ALGO': {
      const amt = action.payload.amountAlgo;
      return { ...state, accountAssets: { ...state.accountAssets, algo: Math.max(0, state.accountAssets.algo - amt), hemp: state.accountAssets.hemp +  (Math.floor(amt * ECON_CONFIG.HEMP_REWARD_PER_ALGO)) } };
    }
    case 'PURCHASE_WITH_USDC': {
      const amt = action.payload.amountUsdc;
      return { ...state, accountAssets: { ...state.accountAssets, usdc: Math.max(0, state.accountAssets.usdc - amt), hemp: state.accountAssets.hemp + (Math.floor(amt * ECON_CONFIG.HEMP_REWARD_PER_USDC)) } };
    }
    case 'CLAIM_WITH_HEMP': {
      const spent = action.payload.hempSpent;
      return { ...state, accountAssets: { ...state.accountAssets, hemp: Math.max(0, state.accountAssets.hemp - spent) } };
    }
    case 'CREDIT_SPIN_HEMP': {
      return { ...state, accountAssets: { ...state.accountAssets, hemp: state.accountAssets.hemp + action.payload.hempWon } };
    }
    case 'RESET_WALLET':
      return { 
        ...state, 
        walletConnected: false, 
        walletAddress: '', 
        accountAssets: initialState.accountAssets,
        stakedAmount: 0,
        spinBonusDiscount: 0,
        lastSpinResult: undefined,
        hasPrizeToClaim: false
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};