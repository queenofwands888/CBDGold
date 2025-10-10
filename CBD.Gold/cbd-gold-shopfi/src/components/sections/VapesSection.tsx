
import React from 'react';

interface VapesSectionProps {
  walletConnected: boolean;
  stakedTokens: number;
  algoBalance: number;
  usdcBalance: number;
  hempBalance: number;
  products: any[];
  tokenPrices: any;
  onPurchase: (vape: any, paymentType: string, discountedPrice: string) => void;
}

const VapesSection: React.FC<VapesSectionProps> = ({ products }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((vape) => (
          <div key={vape.id} className="glass-card rounded-2xl p-6 flex flex-col items-center">
            <img src={vape.image || ''} alt={vape.name} className="w-12 h-12 rounded-full object-cover mb-2" />
            <h3 className="font-bold text-white text-lg mb-1 text-center w-full">{vape.name}</h3>
            <p className="text-sm text-gray-300 mb-2 text-center w-full">{vape.flavor || ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VapesSection;
