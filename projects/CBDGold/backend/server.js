import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import claimPrizeRouter from './routes/claimPrize.js';
import productsRouter from './routes/products.js';
import purchaseRouter from './routes/purchase.js';
import adminClaims from './admin/claims.js';
import adminProducts from './admin/products.js';
import adminAudit from './admin/audit.js';
import adminGovernance from './admin/governance.js';
import adminAnalytics from './admin/analytics.js';
import walletsRouter from './routes/wallets.js';


// Admin API routes (after app is initialized)
// (moved below app initialization)

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
if (process.env.ENABLE_SECURITY_HEADERS === 'true') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));
}

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '1mb' }));

// Removed duplicate claimPrizeRouter mounting; mounted explicitly below.

// Basic admin auth placeholder (API key based) – Replace with stronger auth later.
const requireAdmin = (req, res, next) => {
  const provided = req.header('x-admin-key');
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(500).json({ error: 'Admin API key not configured', code: 'ADMIN_KEY_MISSING' });
  }
  if (provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
  }
  next();
};

// Admin API routes (protected)
app.use('/admin/claims', requireAdmin, adminClaims);
app.use('/admin/products', requireAdmin, adminProducts);
app.use('/admin/audit', requireAdmin, adminAudit);
app.use('/admin/governance', requireAdmin, adminGovernance);
app.use('/admin/analytics', requireAdmin, adminAnalytics);

// Routes
app.use('/', claimPrizeRouter);
app.use('/', productsRouter);
app.use(purchaseRouter);
app.use('/', walletsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for development
app.get('/api/test', (req, res) => {
  try {
    res.json({
      message: 'CBDGold Backend API is working!',
      timestamp: new Date().toISOString(),
      headers: req.headers
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      error: 'Test endpoint failed',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'UNHANDLED_ERROR'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CBDGold Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 Security headers: ${process.env.ENABLE_SECURITY_HEADERS === 'true' ? 'enabled' : 'disabled'}`);
  console.log(`⚡ Rate limiting: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000)} minutes`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
