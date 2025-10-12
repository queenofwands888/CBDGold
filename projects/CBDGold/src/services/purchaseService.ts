// Purchase service for backend API integration
import { logger } from '../utils/logger';

class PurchaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Create a purchase request to the backend
   * @param productId - Product ID to purchase
   * @param buyerAddress - Buyer's wallet address
   * @param stakeTier - Buyer's stake tier (gold, silver, bronze, or none)
   * @param isAdmin - Whether to get admin breakdown (defaults to false for customer view)
   */
  async createPurchase(
    productId: number, 
    buyerAddress: string, 
    stakeTier: string = 'none', 
    isAdmin: boolean = false
  ) {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add admin header if requested
      if (isAdmin) {
        headers['x-admin-view'] = 'true';
      }

      const response = await fetch(`${this.baseUrl}/api/purchase`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId,
          buyerAddress,
          stakeTier: stakeTier.toLowerCase()
        })
      });

      if (!response.ok) {
        throw new Error(`Purchase API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (isAdmin) {
        logger.info('Admin purchase breakdown received', { 
          product: data.product, 
          hotShare: data.hotShare, 
          treasuryShare: data.treasuryShare, 
          operationalShare: data.operationalShare 
        });
      } else {
        logger.info('Customer purchase completed', { 
          product: data.product, 
          amountCharged: data.amountCharged 
        });
      }

      return data;
    } catch (error) {
      logger.error('Purchase service failed', error);
      throw error;
    }
  }

  /**
   * Check backend health before making purchase requests
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/test`);
      return response.ok;
    } catch (error) {
      logger.error('Backend health check failed', error);
      return false;
    }
  }
}

export default new PurchaseService();