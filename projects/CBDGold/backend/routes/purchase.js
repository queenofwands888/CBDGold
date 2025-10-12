import express from 'express';
import { products } from '../data/products.js';
import algosdk from 'algosdk';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Wallets
const HOT_WALLET = process.env.HOT_WALLET || 'GFLK62N2S7EERTGITVJAEQZRRYOMVXBRCKA7H72PRYXNIIRV3NL53I7BBU';
const TREASURY_WALLET = process.env.TREASURY_WALLET || '43IB5RMLM2NFOHOPA6NPHNDL53S2AVZ4KUSRDUQP6WEOLTKFYIPK4VXA6A';
const OPERATIONAL_WALLET = process.env.OPERATIONAL_WALLET || '6YFLAC2EFOKZ7UPL2QV7WUT74IVBJH4AVLM5O76C6A2IKRPQHEEQ7QJO4E';

// POST /api/purchase - Simulate product purchase and fund routing
router.post('/api/purchase', async (req, res) => {
  const { productId, buyerAddress, stakeTier } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Determine discount by stake tier
  let discount = 0;
  if (stakeTier === 'gold') discount = 0.5;
  else if (stakeTier === 'silver') discount = 0.25;
  else if (stakeTier === 'bronze') discount = 0.1;

  // Currency-safe math in cents to avoid floating point drift
  const toDollars = (cents) => Number((cents / 100).toFixed(2));
  const rrpCents = Math.round(product.basePrice * 100);
  const discountCents = Math.round(rrpCents * discount);
  const discountedCents = Math.max(0, rrpCents - discountCents);

  // HOT receives exactly 1/3 of RRP immediately; cap by amount paid (edge-case protection)
  const hotShareRrpCents = Math.round(rrpCents / 3);
  const hotCents = Math.min(hotShareRrpCents, discountedCents);

  // Remaining paid amount after HOT
  const remainingPaidCents = Math.max(0, discountedCents - hotCents);
  // Of the remaining paid amount: 11% to Treasury (rounded), 89% to Operational (residual)
  const treasuryCents = Math.round((remainingPaidCents * 11) / 100);
  const operationalCents = Math.max(0, remainingPaidCents - treasuryCents);

  const isAdminView = (req.get('x-admin-view') || '').toString().toLowerCase() === 'true';

  // Simulate fund routing (admin vs customer response)
  if (isAdminView) {
    res.json({
      product: product.name,
      buyer: buyerAddress,
      stakeTier,
      rrp: toDollars(rrpCents),
      discountedPrice: toDollars(discountedCents),
      hotWallet: HOT_WALLET,
      hotShare: toDollars(hotCents),
      treasuryWallet: TREASURY_WALLET,
      treasuryShare: toDollars(treasuryCents),
      operationalWallet: OPERATIONAL_WALLET,
      operationalShare: toDollars(operationalCents),
      split: {
        hotPercent: 33.3333,
        basis: 'HOT = 1/3 of RRP; Remaining paid amount split 11% Treasury, 89% Operational',
        treasuryPercentOfRemaining: 11,
        operationalPercentOfRemaining: 89,
      },
      message: 'Funds routed: 1/3 of RRP to HOT; remaining paid amount split 11% Treasury, 89% Operational.'
    });
  } else {
    // Customer-friendly response hides internal breakdown
    res.json({
      product: product.name,
      buyer: buyerAddress,
      stakeTier,
      amountCharged: toDollars(discountedCents),
      status: 'ok'
    });
  }
});

export default router;
