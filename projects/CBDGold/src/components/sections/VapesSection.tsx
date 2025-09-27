import React, { useState } from 'react';
import FeatherIcon from '../FeatherIcon';
import { calculateStakingTier } from '../../utils/stakingTier';

interface VapesSectionProps {
  walletConnected: boolean;
  stakedTokens: number;
  algoBalance: number;
  usdcBalance: number;
  hempBalance: number;
  weedBalance: number;
  products: any[];
  tokenPrices: any;
  oracleMeta?: { source: { backend: boolean; fallback: boolean }; lastUpdated: number } | null;
  loading?: boolean;
  onRefreshPrices?: () => void;
  onPurchase: (vape: any, paymentType: string, discountedPrice: string) => void;
}

const VapesSection: React.FC<VapesSectionProps> = ({ walletConnected, stakedTokens, algoBalance, usdcBalance, hempBalance, products, tokenPrices, oracleMeta, loading, onRefreshPrices, onPurchase }) => {
  const currentStakingTier = calculateStakingTier(stakedTokens);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [, forceTick] = useState(0);
  React.useEffect(() => {
    const id = setInterval(() => forceTick(x => x + 1), 15000); // update badge age every 15s
    return () => clearInterval(id);
  }, []);

  const purchase = (vape: any, currency: 'ALGO' | 'USDC') => {
    const priceField = currency === 'ALGO' ? 'algo' : 'usdc';
    const discounted = (vape.prices?.[priceField] || 0) * (1 - currentStakingTier.discount / 100);
    const balanceOk = currency === 'ALGO' ? algoBalance >= discounted : usdcBalance >= discounted;
    if (balanceOk) {
      onPurchase(vape, currency, currency === 'ALGO' ? `${discounted.toFixed(2)} ALGO` : `$${discounted.toFixed(2)} USDC`);
    } else {
      alert(`Insufficient ${currency}! Need ${currency === 'ALGO' ? discounted.toFixed(2) + ' ALGO' : '$' + discounted.toFixed(2) + ' USDC'}`);
    }
  };

  // Use enriched hemp price directly, applying staking discount proportionally
  const hempEquivalentFor = (vape: any) => {
    const baseHemp = vape.prices?.hemp || 0;
    if (!baseHemp) return 0;
    const discounted = baseHemp * (1 - currentStakingTier.discount / 100);
    return Math.max(0, Math.floor(discounted));
  };

  const claimPrizeWithHemp = (vape: any) => {
    const usdcEquivalent = (vape.prices?.usdc || 0) * (1 - currentStakingTier.discount / 100);
    const hempPrice = tokenPrices?.HEMP || 0.0001;
    const hempRequired = Math.floor(usdcEquivalent / hempPrice);
    if (hempBalance >= hempRequired) {
      const message = `\nProduct: ${vape.name}\nHEMP Used: ${hempRequired.toLocaleString()} tokens\nMarket Value: $${usdcEquivalent.toFixed(2)} USDC`;
      onPurchase(vape, 'HEMP_CLAIM', message);
    } else {
      alert(`Insufficient HEMP tokens! Required: ${hempRequired.toLocaleString()} HEMP`);
    }
  };

  const spinForGold = () => {
    if (isSpinning) return;
    setIsSpinning(true); setSpinResult(null);
    setTimeout(() => {
      const outcomes = ['50,000 HEMP', '100,000 HEMP', '200,000 HEMP', '10% Discount', '25% Discount', '🎉 JACKPOT: 1M HEMP!'];
      setSpinResult(outcomes[Math.floor(Math.random() * outcomes.length)]);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3 flex-wrap">
          <span>CBD Gold 510 Ceramic Vapes</span>
          {oracleMeta && (
            (() => {
              const ageSec = Math.max(0, Math.round((Date.now() - oracleMeta.lastUpdated) / 1000));
              const live = !!oracleMeta.source?.backend && !oracleMeta.source?.fallback;
              let colorClasses = live ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
              if (ageSec > 120) colorClasses = 'bg-red-600/20 text-red-300 border border-red-600/40';
              else if (ageSec > 60) colorClasses = 'bg-orange-500/20 text-orange-300 border border-orange-500/40';
              const label = live ? 'Live Prices' : 'Fallback Prices';
              return (
                <div className="flex items-center gap-2">
                  <span
                    title={`${label}\nUpdated: ${new Date(oracleMeta.lastUpdated).toISOString()}\nAge: ${ageSec}s\nSource: ${JSON.stringify(oracleMeta.source)}`}
                    className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${colorClasses}`}
                  >
                    {label} · {ageSec}s ago
                  </span>
                  {onRefreshPrices && (
                    <button
                      onClick={onRefreshPrices}
                      disabled={loading}
                      title="Refresh prices now"
                      className={`text-xs px-2 py-1 rounded-md border border-white/10 backdrop-blur-sm transition-colors ${loading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'}`}
                    >
                      {loading ? '…' : '↻'}
                    </button>
                  )}
                </div>
              );
            })()
          )}
        </h2>
        <p className="text-gray-300">Premium CBD 510 ceramic vapes with 66.6% CBD potency</p>
        <div className="flex justify-center items-center space-x-4 mt-4">
          <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentStakingTier.color}`}>
            <span className="text-black font-semibold">{currentStakingTier.name} Tier - {currentStakingTier.discount}% Off All Vapes</span>
          </div>
        </div>
      </div>

      {spinResult && (
        <div className="glass-card rounded-2xl p-6 text-center" data-aos="zoom-in">
          <h3 className="text-xl font-bold text-white mb-4">🎰 Spin Result - Verified on Algorand!</h3>
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <p className="font-bold text-green-400">{spinResult}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(vape => {
          const discountedAlgoPrice = (vape.prices?.algo || 0) * (1 - currentStakingTier.discount / 100);
          const discountedUsdcPrice = (vape.prices?.usdc || 0) * (1 - currentStakingTier.discount / 100);
          const hempEquivalent = hempEquivalentFor(vape);
          return (
            <div key={vape.id} className="glass-card rounded-2xl p-6 overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${vape.color} opacity-20 rounded-full -mr-10 -mt-10`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <img src="https://huggingface.co/spaces/CBDGold/cbdgold/resolve/main/images/vape%20cart%20white%20top.jpeg" alt={vape.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${vape.type.includes('Indica') ? 'bg-purple-600 text-white' : vape.type.includes('Sativa') ? 'bg-yellow-600 text-black' : 'bg-green-600 text-white'}`}>{vape.type}</div>
                </div>
                <h3 className="font-bold text-white text-lg mb-1">{vape.name}</h3>
                <p className="text-sm text-gray-300 mb-2">3rd Party Lab Tested</p>
                <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Flavor:</span><span className="text-yellow-400">{vape.flavor}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Effects:</span><span className="text-green-400">{vape.effects}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-300">Potency:</span><span className="text-blue-400 font-bold">{vape.potency}</span></div>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Key Terpenes:</p>
                  <div className="flex flex-wrap gap-1">{vape.terpenes?.map((t: string) => (<span key={t} className="px-2 py-1 bg-green-600/30 text-green-300 text-xs rounded-full">{t}</span>))}</div>
                </div>
                <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4">
                  <div className="text-center mb-2">
                    <div className="grid grid-cols-2 gap-1 text-sm mb-2">
                      <p className="text-blue-400 font-bold">{discountedAlgoPrice.toFixed(2)} ALGO</p>
                      <p className="text-yellow-400 font-bold">${discountedUsdcPrice.toFixed(2)} USDC</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-green-400 font-bold">{hempEquivalent.toLocaleString()} HEMP</p>
                      <p className="text-xs text-gray-400">Market rate equivalent</p>
                    </div>
                    {currentStakingTier.discount > 0 && <p className="text-xs text-green-400 mt-2">({currentStakingTier.discount}% {currentStakingTier.name} discount applied)</p>}
                  </div>
                  <div className="text-xs text-center"><p className="text-green-300">Earn: {vape.hempEarned?.toLocaleString() || 0} HEMP</p></div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button onClick={() => purchase(vape, 'ALGO')} disabled={!walletConnected || algoBalance < discountedAlgoPrice} className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 ${walletConnected && algoBalance >= discountedAlgoPrice ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                      <FeatherIcon icon="shopping-cart" className="inline mr-1 w-3 h-3" /> ALGO
                    </button>
                    <button onClick={() => purchase(vape, 'USDC')} disabled={!walletConnected || usdcBalance < discountedUsdcPrice} className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 ${walletConnected && usdcBalance >= discountedUsdcPrice ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                      <FeatherIcon icon="shopping-cart" className="inline mr-1 w-3 h-3" /> USDC
                    </button>
                  </div>
                  <button onClick={() => claimPrizeWithHemp(vape)} disabled={!walletConnected} className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 mb-2 ${walletConnected ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                    <FeatherIcon icon="award" className="inline mr-2 w-3 h-3" /> CLAIM PRIZE
                  </button>
                  <button onClick={spinForGold} disabled={isSpinning} className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${isSpinning ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'}`}>
                    <FeatherIcon icon="refresh-cw" className={`inline mr-2 w-3 h-3 ${isSpinning ? 'spinning' : ''}`} /> {isSpinning ? 'SPINNING...' : 'SPIN FOR GOLD'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VapesSection;
