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
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] w-full text-center bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a2e] pb-12 overflow-hidden rounded-xl mb-10">
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-blue-500/10 to-purple-600/10 animate-pulse-slow blur-2xl opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        <img
          src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/CBD%20Logo%20-%20PNG%20File%20-%20Black%20Background%20-%2072dpi%20-%20Web%20Use.png"
          alt="CBD Gold Logo"
          className="w-32 h-32 rounded-full shadow-2xl mb-6 border-4 border-white/10 bg-black/60 object-cover"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
        />
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl mb-5 tracking-tight leading-tight">
          CBD Gold ShopFi
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 font-medium drop-shadow">
          Premium CBD 510 ceramic vapes, ShopFi staking, and WEED governance.<br className="hidden md:block" />
          <span className="text-green-300 font-semibold">Powered by Algorand.</span>
        </p>
        <button
          className="px-10 py-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-black font-extrabold text-lg shadow-xl hover:from-green-500 hover:to-green-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-400/50 border-2 border-white/10 backdrop-blur-lg"
          onClick={goShopFi}
        >
          Explore ShopFi
        </button>
      </div>
    </section>
  );
};

export default Hero;
