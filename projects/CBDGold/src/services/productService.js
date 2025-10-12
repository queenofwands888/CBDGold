// API service for fetching products and prices from backend
import { logger } from '../utils/logger';
import { getOraclePrices } from './oraclePriceService';

class ProductService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.cache = new Map();
    this.cacheTimeout = 10 * 1000; // 10 seconds for auto-updates
  }

  async fetchProducts() {
    const cacheKey = 'products';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      // Using cached products data - production logging disabled
      return cached.data;
    }

    try {
      // Fetching products - production logging disabled for security
      const response = await fetch(`${this.baseUrl}/api/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.info('Products fetched', { count: data.products?.length || 0 });

      // Enrich with oracle-derived prices BEFORE caching so cache has enriched structure
      const oracle = await getOraclePrices(this.baseUrl);
      const enriched = this._enrichProducts(data, oracle);
      this.cache.set(cacheKey, {
        data: { ...enriched, oracle },
        timestamp: Date.now()
      });
      return { ...enriched, oracle };
    } catch (error) {
      logger.error('Failed to fetch products', error);
      // Return cached data if available, even if stale
      if (cached) {
        logger.warn('Using stale cached product data');
        return cached.data;
      }
      // Fallback to local data if no cache available
      logger.info('Using fallback products data');
      const fallback = this.getFallbackProducts();
      const oracle = await getOraclePrices(this.baseUrl);
      return { ...this._enrichProducts(fallback, oracle), oracle };
    }
  }

  async fetchProduct(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`Failed to fetch product ${id}`, error);
      return null;
    }
  }

  async fetchPrices() {
    const cacheKey = 'prices';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/prices`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      logger.error('Failed to fetch prices', error);
      // Return fallback prices
      return {
        success: true,
        prices: {
          ALGO: 0.25,
          USDC: 1.00,
          HEMP: 0.0001,
          lastUpdate: new Date()
        }
      };
    }
  }

  getFallbackProducts() {
    // Fallback products with static pricing if backend is unavailable
    return {
      success: true,
      products: [
        {
          id: 1,
          name: 'Northern Lights CBD',
          strain: 'Northern Lights',
          type: 'Indica-dominant',
          flavor: 'Sweet Pine & Earth',
          effects: 'Deeply Relaxing',
          basePrice: 33.00,
          prices: { usd: 33.00 },
          hempEarned: 135000,
          potency: '66.6% CBD',
          terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
          color: 'from-purple-500 to-indigo-600',
          emoji: '🌌',
          category: 'vape',
          inStock: true
        },
        {
          id: 2,
          name: 'Sour Diesel CBD',
          strain: 'Sour Diesel',
          type: 'Sativa-dominant',
          flavor: 'Citrus Fuel & Herbs',
          effects: 'Energizing Focus',
          basePrice: 33.00,
          prices: { usd: 33.00 },
          hempEarned: 135000,
          potency: '66.6% CBD',
          terpenes: ['Limonene', 'Caryophyllene', 'Myrcene'],
          color: 'from-yellow-500 to-orange-600',
          emoji: '⚡',
          category: 'vape',
          inStock: true
        },
        {
          id: 3,
          name: 'OG Kush CBD',
          strain: 'OG Kush',
          type: 'Hybrid',
          flavor: 'Earthy Lemon Pine',
          effects: 'Balanced Euphoria',
          basePrice: 33.00,
          prices: { usd: 33.00 },
          hempEarned: 135000,
          potency: '66.6% CBD',
          terpenes: ['Myrcene', 'Limonene', 'Caryophyllene'],
          color: 'from-green-500 to-emerald-600',
          emoji: '👑',
          category: 'vape',
          inStock: true
        },
        {
          id: 4,
          name: 'Blue Dream CBD',
          strain: 'Blue Dream',
          type: 'Sativa-dominant',
          flavor: 'Blueberry & Vanilla',
          effects: 'Creative & Uplifting',
          basePrice: 33.00,
          prices: { usd: 33.00 },
          hempEarned: 135000,
          potency: '66.6% CBD',
          terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
          color: 'from-blue-500 to-indigo-600',
          emoji: '💙',
          category: 'vape',
          inStock: true
        },
        {
          id: 5,
          name: 'Girl Scout Cookies CBD',
          strain: 'Girl Scout Cookies',
          type: 'Hybrid',
          flavor: 'Sweet Mint & Chocolate',
          effects: 'Relaxed Focus',
          basePrice: 34.50,
          prices: { usd: 34.50 },
          hempEarned: 140000,
          potency: '68.2% CBD',
          terpenes: ['Caryophyllene', 'Limonene', 'Humulene'],
          color: 'from-pink-500 to-rose-600',
          emoji: '🍪',
          category: 'vape',
          inStock: true
        },
        {
          id: 6,
          name: 'White Widow CBD',
          strain: 'White Widow',
          type: 'Hybrid',
          flavor: 'Woody & Spicy',
          effects: 'Euphoric Balance',
          basePrice: 33.75,
          prices: { usd: 33.75 },
          hempEarned: 138000,
          potency: '67.3% CBD',
          terpenes: ['Myrcene', 'Caryophyllene', 'Pinene'],
          color: 'from-gray-400 to-slate-600',
          emoji: '🕷️',
          category: 'vape',
          inStock: true
        },
        {
          id: 7,
          name: 'Pineapple Express CBD',
          strain: 'Pineapple Express',
          type: 'Sativa-dominant',
          flavor: 'Tropical Pineapple',
          effects: 'Happy & Energetic',
          basePrice: 35.00,
          prices: { usd: 35.00 },
          hempEarned: 142000,
          potency: '69.1% CBD',
          terpenes: ['Limonene', 'Myrcene', 'Pinene'],
          color: 'from-yellow-400 to-amber-600',
          emoji: '🍍',
          category: 'vape',
          inStock: true
        },
        {
          id: 8,
          name: 'Purple Haze CBD',
          strain: 'Purple Haze',
          type: 'Sativa-dominant',
          flavor: 'Berry & Floral',
          effects: 'Dreamy & Uplifting',
          basePrice: 36.00,
          prices: { usd: 36.00 },
          hempEarned: 145000,
          potency: '70.5% CBD',
          terpenes: ['Terpinolene', 'Myrcene', 'Caryophyllene'],
          color: 'from-purple-600 to-violet-700',
          emoji: '💜',
          category: 'vape',
          inStock: true
        }
      ],
      tokenPrices: {}
    };
  }

  clearCache() {
    this.cache.clear();
  }

  _enrichProducts(raw, oracle) {
    const algoUsd = oracle.algoUsd || 0.25;
    const hempUsd = oracle.hempUsd || 0.0001;
    const weedUsd = oracle.weedUsd || 0.00008;
    const products = (raw.products || []).map(p => {
      const usd = p.prices?.usd ?? p.basePrice ?? 0;
      const algo = usd / algoUsd;
      const usdc = usd; // peg
      const hemp = usd / hempUsd;
      return {
        ...p,
        prices: {
          usd: usd,
          algo: Number.isFinite(algo) ? algo : 0,
          usdc: Number.isFinite(usdc) ? usdc : 0,
          hemp: Number.isFinite(hemp) ? Math.round(hemp) : 0
        }
      };
    });
    return { ...raw, products, tokenPrices: { ALGO: algoUsd, HEMP: hempUsd, WEED: weedUsd, USDC: 1 } };
  }

  // Format price for display
  formatPrice(price, currency) {
    switch (currency.toLowerCase()) {
      case 'usd':
      case 'usdc':
        return `$${price.toFixed(2)}`;
      case 'algo':
        return `${price.toFixed(2)} ALGO`;
      case 'hemp':
        return `${price.toLocaleString()} HEMP`;
      default:
        return `${price} ${currency.toUpperCase()}`;
    }
  }
}

export default new ProductService();
