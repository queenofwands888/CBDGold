# CBDGold Backend

Secure backend API for CBDGold application that handles sensitive API operations, preventing client-side exposure of API keys and tokens.

## 🔐 Security Features

- **API Key Protection**: HuggingFace API tokens are never exposed to the frontend
- **Rate Limiting**: Prevents abuse with configurable request limits
- **Input Validation**: Sanitizes and validates all incoming data
- **Security Headers**: Implements CORS, CSP, and other security headers
- **Error Handling**: Prevents information leakage through proper error responses
- **Request Logging**: Monitors API usage without logging sensitive data

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp .env.template .env

# Edit .env with your actual values
nano .env
```

Required environment variables:
- `HF_TOKEN`: Your HuggingFace API token (get from https://huggingface.co/settings/tokens)
- `HF_MODEL`: Your HuggingFace model name
- `FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)

### 3. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on port 3001 by default.

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server health status and uptime.

### HuggingFace Query
```
POST /api/huggingface/query
Content-Type: application/json

{
  "text": "Your input text here"
}
```

**Security Features:**
- Input validation (max 5000 characters)
- HTML/script injection prevention
- Rate limiting (100 requests per 15 minutes by default)
- Error sanitization

## 🛡️ Security Implementation

### Before (Vulnerable)
```javascript
// Frontend had direct API access - SECURITY RISK!
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN; // ❌ Exposed to client
fetch(`https://api-inference.huggingface.co/models/${model}`, {
  headers: { Authorization: `Bearer ${HF_TOKEN}` } // ❌ Token in browser
});
```

### After (Secure)
```javascript
// Frontend calls secure backend proxy - SECURE ✅
fetch(`${BACKEND_URL}/api/huggingface/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // ✅ No tokens
  body: JSON.stringify({ text })
});
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Allowed frontend origin | http://localhost:5173 |
| `HF_TOKEN` | HuggingFace API token | Required |
| `HF_MODEL` | HuggingFace model name | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `ENABLE_SECURITY_HEADERS` | Enable Helmet security | true |

### Rate Limiting

Default configuration:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Response**: 429 status with retry information

### CORS Policy

- **Origin**: Configured frontend URL only
- **Methods**: GET, POST only
- **Headers**: Content-Type, Authorization only
- **Credentials**: Disabled for security

## 📝 Development

### Project Structure
```
backend/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── .env.template       # Environment template
├── .env               # Your actual environment (gitignored)
└── README.md          # This file
```

### Adding New Endpoints

1. Add route handler with proper validation
2. Implement error handling
3. Add security checks (rate limiting, input validation)
4. Update this README

### Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test HuggingFace proxy
curl -X POST http://localhost:3001/api/huggingface/query \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}'
```

## 🚨 Security Checklist

- [x] API keys stored server-side only
- [x] Input validation and sanitization
- [x] Rate limiting implemented
- [x] CORS properly configured
- [x] Security headers enabled
- [x] Error messages sanitized
- [x] Request logging (without sensitive data)
- [x] Graceful error handling
- [x] Environment variable validation

## 🔄 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure proper `FRONTEND_URL`
3. Use strong rate limits
4. Enable all security headers
5. Set up process manager (PM2)
6. Configure reverse proxy (nginx)
7. Set up SSL/TLS certificates
8. Monitor logs and health

### Example PM2 Configuration

```json
{
  "name": "cbdgold-backend",
  "script": "server.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3001
  }
}
```

## 📊 Monitoring

The server logs:
- Successful API requests (without sensitive data)
- Rate limit violations
- Configuration errors
- Server startup/shutdown events

Monitor these logs for security events and performance issues.

## 🆘 Troubleshooting

### Common Issues

1. **"Service configuration error"**
   - Check HF_TOKEN and HF_MODEL in .env
   - Ensure tokens are not placeholder values

2. **CORS errors**
   - Verify FRONTEND_URL matches your frontend
   - Check browser console for specific CORS issues

3. **Rate limiting**
   - Wait for rate limit window to reset
   - Adjust limits in environment variables

4. **API errors**
   - Check HuggingFace API status
   - Verify model name and token validity

## 🔒 Security Contact

If you discover a security vulnerability, please report it responsibly by contacting the development team directly rather than opening a public issue.
