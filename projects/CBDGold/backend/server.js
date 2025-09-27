
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import claimPrizeRouter from './routes/claimPrize.js';
import productsRouter from './routes/products.js';
import adminClaims from './admin/claims.js';
import adminProducts from './admin/products.js';
import adminAudit from './admin/audit.js';
import adminGovernance from './admin/governance.js';
import adminAnalytics from './admin/analytics.js';


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
        connectSrc: ["'self'", "https://api-inference.huggingface.co"],
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

// Input validation middleware
const validateInput = (req, res, next) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      error: 'Invalid input: text field is required and must be a string'
    });
  }

  if (text.length > 5000) {
    return res.status(400).json({
      error: 'Input too long: text must be less than 5000 characters'
    });
  }

  // Sanitize input (basic HTML/script injection prevention)
  req.body.text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  next();
};

// Routes
app.use('/', claimPrizeRouter);
app.use('/', productsRouter);

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

// Additional tighter rate limit for HuggingFace proxy
const hfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.HF_RATE_LIMIT_MAX || '15'),
  standardHeaders: true,
  legacyHeaders: false
});

// HuggingFace API proxy endpoint (with timeout & abort)
app.post('/api/huggingface/query', hfLimiter, validateInput, async (req, res) => {
  const controller = new AbortController();
  const timeoutMs = parseInt(process.env.HF_TIMEOUT_MS || '15000');
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Validate environment variables
    const HF_TOKEN = process.env.HF_TOKEN;
    const HF_MODEL = process.env.HF_MODEL;

    if (!HF_TOKEN || HF_TOKEN === 'your_actual_hugging_face_token_here') {
      console.error('HuggingFace token not configured');
      return res.status(500).json({
        error: 'Service configuration error'
      });
    }

    if (!HF_MODEL || HF_MODEL === 'your_model_name_here') {
      console.error('HuggingFace model not configured');
      return res.status(500).json({
        error: 'Service configuration error'
      });
    }

    const { text } = req.body;

    // Make request to HuggingFace API
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CBDGold-Backend/1.0.0'
        },
        body: JSON.stringify({ inputs: text })
      });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API error:', response.status, errorText);

      // Don't expose internal API errors to client
      return res.status(500).json({
        error: 'External service temporarily unavailable',
        code: 'HF_API_ERROR'
      });
    }

    const result = await response.json();

    // Log successful request (without sensitive data)
    console.log(`HF API request successful for model: ${HF_MODEL}`);

    res.json(result);

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('HuggingFace proxy timeout');
      return res.status(504).json({ error: 'External service timeout', code: 'HF_TIMEOUT' });
    }
    console.error('Server error in HuggingFace proxy:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    clearTimeout(timeout);
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
