// Price oracle service for real-time token prices
class PriceOracle {
  constructor() {
    this.prices = {
      ALGO: 0.25, // Default fallback prices
      USDC: 1.00,
      HEMP: 0.0001 // HEMP token price for redemption
    };
    this.lastUpdate = null;
    this.updateInterval = 10 * 1000; // 10 seconds for real-time updates
  }

  async fetchAlgoPrice() {
    try {
      // Using CoinGecko API for ALGO price
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd');
      const data = await response.json();
      return data.algorand?.usd || this.prices.ALGO;
    } catch (error) {
      console.error('Failed to fetch ALGO price:', error);
      return this.prices.ALGO;
    }
  }

  async fetchUSDCPrice() {
    try {
      // USDC should always be ~$1, but let's fetch for accuracy
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd');
      const data = await response.json();
      return data['usd-coin']?.usd || 1.00;
    } catch (error) {
      console.error('Failed to fetch USDC price:', error);
      return 1.00;
    }
  }

  async fetchHempPrice() {
    // For HEMP token (ASA: 2675148574), integrate with:
    // 1. DEX APIs (like Tinyman, Pact, etc.)
    // 2. Your own pricing logic
    // 3. Manual price updates

    // Example: Fetch from Tinyman or other Algorand DEX
    try {
      // This would be your actual DEX integration
      // const hempPrice = await this.fetchFromTinyman('2675148574');

      // For now, using placeholder logic with some volatility
      const baseHempPrice = 0.0001;

      // Add some realistic price movement (±5%)
      const hempVariation = 1 + (Math.random() - 0.5) * 0.1;

      return baseHempPrice * hempVariation;
    } catch (error) {
      console.error('Failed to fetch HEMP price:', error);
      return this.prices.HEMP;
    }
  }

  async updatePrices() {
    console.log('Updating token prices...');

    try {
      const [algoPrice, usdcPrice, hempPrice] = await Promise.all([
        this.fetchAlgoPrice(),
        this.fetchUSDCPrice(),
        this.fetchHempPrice()
      ]);

      this.prices = {
        ALGO: algoPrice,
        USDC: usdcPrice,
        HEMP: hempPrice
      };

      this.lastUpdate = new Date();
      console.log('Prices updated:', this.prices);
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  shouldUpdate() {
    if (!this.lastUpdate) return true;
    return Date.now() - this.lastUpdate.getTime() > this.updateInterval;
  }

  async getPrices() {
    if (this.shouldUpdate()) {
      await this.updatePrices();
    }
    return { ...this.prices, lastUpdate: this.lastUpdate };
  }

  // Convert USD price to token equivalent
  convertPrice(usdPrice, token) {
    const tokenPrice = this.prices[token.toUpperCase()];
    if (!tokenPrice) return null;
    return usdPrice / tokenPrice;
  }

  // Get all token prices for a USD base price
  getAllTokenPrices(usdPrice) {
    return {
      USD: usdPrice,
      ALGO: this.convertPrice(usdPrice, 'ALGO'),
      USDC: this.convertPrice(usdPrice, 'USDC'),
      HEMP: this.convertPrice(usdPrice, 'HEMP')
    };
  }
}

export default new PriceOracle();
