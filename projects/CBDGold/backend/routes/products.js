import express from 'express';
import { products } from '../data/products.js';
import priceOracle from '../services/priceOracle.js';

const router = express.Router();

// GET /api/products - Get all products with real-time pricing
router.get('/api/products', async (req, res) => {
  try {
    // Get current token prices
    const prices = await priceOracle.getPrices();

    // Calculate real-time prices for each product
    const productsWithPricing = products.map(product => {
      const tokenPrices = priceOracle.getAllTokenPrices(product.basePrice);

      return {
        ...product,
        prices: {
          usd: product.basePrice,
          algo: Number(tokenPrices.ALGO?.toFixed(2)) || 0,
          usdc: Number(tokenPrices.USDC?.toFixed(2)) || 0,
          hemp: Math.floor(tokenPrices.HEMP) || 0
        },
        priceUpdate: prices.lastUpdate
      };
    });

    res.json({
      success: true,
      products: productsWithPricing,
      tokenPrices: prices,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products with pricing'
    });
  }
});

// GET /api/products/:id - Get single product with pricing
router.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const prices = await priceOracle.getPrices();
    const tokenPrices = priceOracle.getAllTokenPrices(product.basePrice);

    const productWithPricing = {
      ...product,
      prices: {
        usd: product.basePrice,
        algo: Number(tokenPrices.ALGO?.toFixed(2)) || 0,
        usdc: Number(tokenPrices.USDC?.toFixed(2)) || 0,
        hemp: Math.floor(tokenPrices.HEMP) || 0
      },
      priceUpdate: prices.lastUpdate
    };

    res.json({
      success: true,
      product: productWithPricing,
      tokenPrices: prices,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product with pricing'
    });
  }
});

// GET /api/prices - Get current token prices
router.get('/api/prices', async (req, res) => {
  try {
    const prices = await priceOracle.getPrices();
    res.json({
      success: true,
      prices,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token prices'
    });
  }
});

export default router;
