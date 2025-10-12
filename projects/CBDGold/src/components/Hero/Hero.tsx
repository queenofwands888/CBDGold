import React from 'react';
import { useAppContext } from '../../contexts';

const Hero: React.FC = () => {
  const { dispatch } = useAppContext();

  const goShopFi = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'shopfi' });
    // Optionally smooth scroll to the tab content if layout height is large
    const tabsY = document.querySelector('[data-nav-tabs]')?.getBoundingClientRect().top;
    if (tabsY !== undefined) {
      window.scrollBy({ top: tabsY - 80, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full mb-8 animate-fadeIn">
      {/* Glass card frame with border */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="relative flex flex-col items-center justify-center min-h-[70vh] w-full text-center">
          {/* Animated background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-brand-midnight to-surface-elevated" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 via-brand-emerald/5 to-brand-purple/10 animate-pulse-slow blur-3xl" />

          {/* Accent orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-emerald/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 md:py-20 max-w-5xl mx-auto w-full">
            {/* Logo with glow effect */}
            <div className="relative mb-8 animate-slideUp">
              <div className="absolute inset-0 bg-brand-emerald/30 rounded-full blur-2xl animate-glow" />
              <img
                src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/CBD%20Logo%20-%20PNG%20File%20-%20Black%20Background%20-%2072dpi%20-%20Web%20Use.png"
                alt="CBD Gold Logo"
                className="relative w-36 h-36 rounded-full shadow-card border-2 border-white/10 bg-gradient-to-br from-surface to-surface-elevated object-cover backdrop-blur-sm"
              />
            </div>

            {/* Heading with gradient text */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-white via-brand-emerald to-white bg-clip-text text-transparent">
                Welcome to ShopFi
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-medium leading-relaxed animate-slideUp" style={{ animationDelay: '0.2s' }}>
              eShopping is the concept, CBD Gold is the Brand!
              <br className="hidden md:block" />
              <span className="inline-flex items-center gap-2 mt-2 text-red-400 font-bold text-xl">
                TEST IS ON TEST NET - Do not send real funds!!!
              </span>
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <button
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-brand-green to-brand-emerald text-black font-bold text-lg shadow-glow-green hover:shadow-glow-green hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-emerald/50 overflow-hidden"
                onClick={goShopFi}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Explore ShopFi
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
