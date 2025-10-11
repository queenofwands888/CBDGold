import algosdk from 'algosdk';
import express from 'express';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import { TextEncoder } from 'util';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const CLAIM_RATE_WINDOW = parseInt(process.env.CLAIM_RATE_LIMIT_WINDOW_MS, 10) || 10 * 60 * 1000; // default 10 minutes
const CLAIM_RATE_MAX = parseInt(process.env.CLAIM_RATE_LIMIT_MAX_REQUESTS, 10) || 5;

const claimLimiter = rateLimit({
  windowMs: CLAIM_RATE_WINDOW,
  max: CLAIM_RATE_MAX,
  message: {
    error: 'Too many claim attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const sanitizeText = (value = '') => {
  return String(value)
    .replace(/[<>"'`$]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 500);
};

const isValidAlgorandAddress = (address = '') => /^[A-Z2-7]{58}$/.test(address);

router.use('/api/claim-prize', claimLimiter);

// POST /api/claim-prize
router.post('/api/claim-prize', async (req, res) => {
  const { wallet, prizeId, shippingAddress, signature } = req.body;

  if (!wallet || !isValidAlgorandAddress(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const numericPrizeId = Number(prizeId);
  if (!Number.isInteger(numericPrizeId) || numericPrizeId < 0) {
    return res.status(400).json({ error: 'Invalid prize identifier' });
  }

  const sanitizedAddress = sanitizeText(shippingAddress);
  if (!sanitizedAddress || sanitizedAddress.length < 10) {
    return res.status(400).json({ error: 'Shipping address is required and must be at least 10 characters' });
  }

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Valid signature is required' });
  }

  const message = `I claim my prize ${numericPrizeId} for shipping to: ${sanitizedAddress}`;

  // Verify signature
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Uint8Array.from(Buffer.from(signature, 'base64'));
    const isValid = algosdk.verifyBytes(messageBytes, signatureBytes, wallet);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (e) {
    console.error('Signature verification failed:', e);
    return res.status(400).json({ error: 'Signature verification failed' });
  }

  // TODO: Check on-chain that wallet owns the prizeId NFT/ASA

  // Prepare QR payload
  const qrPayload = JSON.stringify({
    wallet,
    prizeId: numericPrizeId,
    shippingAddress: sanitizedAddress,
    timestamp: Date.now()
  });

  // Generate QR code as Data URL
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(qrPayload);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }

  // Email QR code to accounts@cbdgold.life
  try {
    // Setup nodemailer transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Extract base64 from data URL
    const base64Data = qrCodeDataUrl.split(',')[1];

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'CBDGold Prize <noreply@cbdgold.life>',
      to: process.env.EMAIL_TO || 'accounts@cbdgold.life',
      subject: `CBDGold Prize Claim: ${prizeId}`,
      text: `A new prize claim has been submitted.\n\nWallet: ${wallet}\nPrize ID: ${numericPrizeId}\nShipping Address: ${sanitizedAddress}`,
      attachments: [
        {
          filename: `cbdgold-claim-${numericPrizeId}.png`,
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'image/png'
        }
      ]
    });
  } catch (err) {
    // Log but do not block user response
    console.error('Failed to send claim email:', err);
  }

  res.json({ success: true, qrCode: qrCodeDataUrl });
});

export default router;
