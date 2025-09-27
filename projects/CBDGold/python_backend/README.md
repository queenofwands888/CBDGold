# CBD Gold ShopFi Python Backend

A comprehensive Python backend API for the CBD Gold ShopFi DeFi platform built with FastAPI.

## Features

- 🚀 **FastAPI** - Modern, fast web framework
- 🔗 **Algorand Integration** - Full support for Algorand blockchain
- 💰 **Token Management** - HEMP, WEED, ALGO, and USDC support
- 🏦 **Staking System** - Multi-tier staking pools with rewards
- 🗳️ **Governance** - Decentralized voting system
- 🎰 **Prize System** - Spin-to-win functionality
- 📊 **Price Oracle** - Real-time token price feeds
- 🔐 **Security** - Rate limiting, input validation, and more
- 📈 **Monitoring** - Health checks and logging

## Quick Start

### Prerequisites

- Python 3.11+
- pip
- Virtual environment (recommended)

### Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd python_backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the server:**
   ```bash
   python start.py
   ```

   Or use uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Test the API:**
   ```bash
   python test_api.py
   ```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Core Endpoints

- `GET /health` - Health check
- `GET /api/prices` - Token prices
- `GET /api/oracle-meta` - Oracle metadata

### Product Management

- `GET /api/products` - All products
- `GET /api/products/{id}` - Specific product

### Staking

- `GET /api/staking/pools` - Staking pools
- `POST /api/staking/stake` - Stake tokens
- `POST /api/staking/unstake` - Unstake tokens

### Governance

- `GET /api/governance/proposals` - All proposals
- `POST /api/governance/vote` - Vote on proposal

### Wallet

- `GET /api/wallet/{address}` - Wallet information

### Prize System

- `POST /api/prizes/spin` - Spin for prize
- `GET /api/prizes/winners` - Recent winners

## Configuration

The backend uses environment variables for configuration. Copy `.env.example` to `.env` and modify:

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Algorand
ALGORAND_NETWORK=testnet
ALGOD_SERVER=https://testnet-api.algonode.cloud

# Asset IDs (TestNet)
HEMP_ASSET_ID=2675148574
WEED_ASSET_ID=2676316280
USDC_ASSET_ID=31566704
```

## Docker Deployment

### Build and run with Docker:

```bash
docker build -t cbdgold-backend .
docker run -p 8000:8000 --env-file .env cbdgold-backend
```

### Or use Docker Compose:

```bash
docker-compose up -d
```

## Development

### Project Structure

```
python_backend/
├── main.py              # FastAPI application
├── config.py            # Configuration management
├── start.py             # Startup script
├── requirements.txt     # Python dependencies
├── models/
│   ├── __init__.py
│   └── models.py        # Pydantic models
├── services/
│   ├── __init__.py
│   ├── oracle_service.py    # Price oracle
│   ├── contract_service.py  # Smart contracts
│   ├── product_service.py   # Product management
│   └── wallet_service.py    # Wallet integration
├── utils/
│   ├── __init__.py
│   ├── logger.py        # Logging utilities
│   └── security.py      # Security utilities
└── tests/
    └── test_api.py      # API tests
```

### Running Tests

```bash
# Start the server first
python start.py

# In another terminal, run tests
python test_api.py

# Or use pytest for unit tests
pytest tests/
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## Integration with Frontend

The backend is designed to work with the React frontend. Make sure to:

1. **Update the frontend API URL** in your React app:
   ```javascript
   const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';
   ```

2. **Enable CORS** for your frontend domain in the backend configuration.

3. **Use the same asset IDs** in both frontend and backend.

## Production Deployment

### Environment Setup

1. Set `ENVIRONMENT=production`
2. Use strong secrets for `API_SECRET_KEY` and `JWT_SECRET`
3. Configure proper database and Redis URLs
4. Set appropriate rate limits
5. Enable SSL/TLS

### Recommended Stack

- **Web Server**: Nginx (reverse proxy)
- **ASGI Server**: Gunicorn + Uvicorn workers
- **Database**: PostgreSQL
- **Cache**: Redis
- **Monitoring**: Prometheus + Grafana

## Security

- Input validation with Pydantic
- Rate limiting per IP/user
- CORS configuration
- Request/response logging
- Error handling without information leakage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the CBD Gold team or create an issue in the repository.