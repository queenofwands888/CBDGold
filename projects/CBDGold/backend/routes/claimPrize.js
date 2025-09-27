import algosdk from 'algosdk';
import express from 'express';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// POST /api/claim-prize
router.post('/api/claim-prize', async (req, res) => {
  const { wallet, prizeId, shippingAddress, signature } = req.body;
  const message = `I claim my prize ${prizeId} for shipping to: ${shippingAddress}`;

  // Verify signature
  try {
    const isValid = algosdk.verifyBytes(
      new Uint8Array(Buffer.from(message)),
      new Uint8Array(Buffer.from(signature, 'base64')),
      wallet
    );
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Signature verification failed' });
  }

  // TODO: Check on-chain that wallet owns the prizeId NFT/ASA

  // Prepare QR payload
  const qrPayload = JSON.stringify({
    wallet,
    prizeId,
    shippingAddress,
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
      text: `A new prize claim has been submitted.\n\nWallet: ${wallet}\nPrize ID: ${prizeId}\nShipping Address: ${shippingAddress}`,
      attachments: [
        {
          filename: `cbdgold-claim-${prizeId}.png`,
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
