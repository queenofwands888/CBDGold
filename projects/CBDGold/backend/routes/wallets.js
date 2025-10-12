import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const HOT_WALLET = process.env.HOT_WALLET || 'GFLK62N2S7EERTGITVJAEQZRRYOMVXBRCKA7H72PRYXNIIRV3NL53I7BBU';
const TREASURY_WALLET = process.env.TREASURY_WALLET || '43IB5RMLM2NFOHOPA6NPHNDL53S2AVZ4KUSRDUQP6WEOLTKFYIPK4VXA6A';
const OPERATIONAL_WALLET = process.env.OPERATIONAL_WALLET || '6YFLAC2EFOKZ7UPL2QV7WUT74IVBJH4AVLM5O76C6A2IKRPQHEEQ7QJO4E';

router.get('/api/wallets', (req, res) => {
  res.json({
    hot: HOT_WALLET,
    treasury: TREASURY_WALLET,
    operational: OPERATIONAL_WALLET
  });
});

export default router;