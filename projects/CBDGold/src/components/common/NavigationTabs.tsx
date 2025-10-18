import React from 'react';
import { useAppContext } from '../../contexts';
import FeatherIcon from '../FeatherIcon';

// Tab definitions for primary app sections
// Internal keys: dashboard, vapes (CBD Gold products), shopfi (staking), governance
const tabs: { key: string; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'vapes', label: 'eShop', icon: 'shopping-bag' },
  { key: 'shopfi', label: 'ShopFi', icon: 'lock' },
  { key: 'governance', label: 'Governance', icon: 'users' }
];

const NavigationTabs: React.FC = () => {
  const { state, dispatch } = useAppContext();
  return (
    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
      {tabs.map(t => {
        const active = state.activeTab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: t.key })}
            className={`tab-btn flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm ${active
                ? 'bg-gradient-to-r from-brand-green to-brand-emerald text-black shadow-glow-green scale-105 border-brand-emerald/50'
                : 'text-gray-300 hover:text-white hover:scale-105'
              }`}
          >
            <FeatherIcon icon={t.icon} className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default NavigationTabs;
