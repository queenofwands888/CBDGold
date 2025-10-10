import React from 'react';
import { useAppContext } from '../../contexts';
import FeatherIcon from '../FeatherIcon';

// Map to HuggingFace space tab naming & order
// Internal keys: dashboard, vapes (CBD Gold products), shopfi (staking), governance
const tabs: { key: string; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'vapes', label: 'CBD Gold', icon: 'shopping-bag' },
  { key: 'shopfi', label: 'ShopFi', icon: 'lock' },
  { key: 'governance', label: 'Governance', icon: 'users' }
];

const NavigationTabs: React.FC = () => {
  const { state, dispatch } = useAppContext();
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {tabs.map(t => {
        const active = state.activeTab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: t.key })}
            className={`tab-btn flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all text-sm ${
              active
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg scale-105'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
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
