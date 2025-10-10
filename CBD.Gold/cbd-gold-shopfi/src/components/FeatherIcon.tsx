import React, { useEffect } from 'react';

declare global {
  interface Window {
    feather?: { replace: () => void };
  }
}

// Lightweight wrapper around feather-icons auto replacement
const FeatherIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-4 h-4' }) => {
  useEffect(() => {
    if (window.feather) window.feather.replace();
  }, [icon]);
  return <i data-feather={icon} className={className} />;
};

export default FeatherIcon;
