// Admin utilities for testing purchase breakdown in development
import purchaseService from '../services/purchaseService';
import { logger } from '../utils/logger';

export class AdminUtils {
  /**
   * Test admin purchase breakdown for development
   */
  static async testAdminPurchase(productId: number = 1, stakeTier: string = 'gold') {
    try {
      console.log('🔧 Testing admin purchase breakdown...');

      const adminResult = await purchaseService.createPurchase(
        productId,
        'TEST_ADMIN_ADDRESS',
        stakeTier,
        true // Admin view
      );

      console.log('📊 Admin Purchase Breakdown:', {
        product: adminResult.product,
        rrp: adminResult.rrp,
        discountedPrice: adminResult.discountedPrice,
        hotShare: adminResult.hotShare,
        treasuryShare: adminResult.treasuryShare,
        operationalShare: adminResult.operationalShare,
        split: adminResult.split
      });

      return adminResult;
    } catch (error) {
      console.error('❌ Admin purchase test failed:', error);
      return null;
    }
  }

  /**
   * Test customer purchase view for development
   */
  static async testCustomerPurchase(productId: number = 1, stakeTier: string = 'gold') {
    try {
      console.log('👤 Testing customer purchase view...');

      const customerResult = await purchaseService.createPurchase(
        productId,
        'TEST_CUSTOMER_ADDRESS',
        stakeTier,
        false // Customer view
      );

      console.log('💰 Customer Purchase:', {
        product: customerResult.product,
        amountCharged: customerResult.amountCharged,
        status: customerResult.status
      });

      return customerResult;
    } catch (error) {
      console.error('❌ Customer purchase test failed:', error);
      return null;
    }
  }

  /**
   * Compare all stake tiers for a product
   */
  static async compareStakeTiers(productId: number = 1) {
    console.log('🏆 Comparing all stake tiers...');
    const tiers = ['none', 'bronze', 'silver', 'gold'];

    for (const tier of tiers) {
      const result = await this.testAdminPurchase(productId, tier);
      if (result) {
        console.log(`${tier.toUpperCase()}: RRP $${result.rrp} → Charged $${result.discountedPrice} → HOT $${result.hotShare}`);
      }
    }
  }
}

// Export to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).AdminUtils = AdminUtils;
  console.log('🔧 AdminUtils available in browser console. Try:');
  console.log('AdminUtils.testAdminPurchase(1, "gold")');
  console.log('AdminUtils.testCustomerPurchase(1, "silver")');
  console.log('AdminUtils.compareStakeTiers(1)');
}