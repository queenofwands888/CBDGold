// TypeScript declaration for productService.js

declare interface Product {
  id: number;
  name: string;
  strain: string;
  type: string;
  flavor: string;
  effects: string;
  basePrice: number;
  prices: {
    usd: number;
    algo?: number;
    usdc?: number;
    hemp?: number;
  };
  hempEarned: number;
  potency: string;
  terpenes: string[];
  color: string;
  emoji: string;
  category: string;
  inStock: boolean;
}

declare interface OraclePrices {
  algoUsd: number;
  hempUsd: number;
  usdcUsd: number;
  source: string;
  fetchedAt: number;
}

declare interface ProductService {
  fetchProducts(): Promise<{ products: Product[]; tokenPrices: Record<string, number>; oracle: OraclePrices }>;
  fetchProduct(id: number): Promise<Product | null>;
  fetchPrices(): Promise<{ success: boolean; prices: Record<string, number> }>;
  getFallbackProducts(): { success: boolean; products: Product[]; tokenPrices: Record<string, number> };
  clearCache(): void;
  formatPrice(price: number, currency: string): string;
}

declare const productService: ProductService;
export default productService;
