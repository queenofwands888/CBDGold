#!/usr/bin/env python3
"""
CBD Gold ShopFi - Main Python Backend Server
Provides API endpoints for the React frontend and smart contract integration
"""

import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import logging
from datetime import datetime, timedelta
import json

# Add project root to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from .services.oracle_service import OracleService
from .services.contract_service import ContractService
from .services.product_service import ProductService
from .services.wallet_service import WalletService
from .models.models import (
    TokenPrice, Product, StakingPool, GovernanceProposal,
    WalletInfo, TransactionRequest, StakeRequest, VoteRequest
)
from .utils.security import SecurityManager
from .utils.logger import get_logger

# Initialize logging
logger = get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CBD Gold ShopFi API",
    description="Backend API for CBD Gold ShopFi DeFi Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
oracle_service = OracleService()
contract_service = ContractService()
product_service = ProductService()
wallet_service = WalletService()
security_manager = SecurityManager()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "oracle": await oracle_service.health_check(),
            "contracts": await contract_service.health_check(),
            "products": await product_service.health_check()
        }
    }

# Price and Oracle endpoints
@app.get("/api/prices", response_model=Dict[str, TokenPrice])
async def get_token_prices():
    """Get current token prices from oracle"""
    try:
        prices = await oracle_service.get_token_prices()
        return prices
    except Exception as e:
        logger.error(f"Error fetching prices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch token prices")

@app.get("/api/oracle-meta")
async def get_oracle_metadata():
    """Get oracle metadata and status"""
    try:
        meta = await oracle_service.get_oracle_metadata()
        return meta
    except Exception as e:
        logger.error(f"Error fetching oracle metadata: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch oracle metadata")

# Product endpoints
@app.get("/api/products", response_model=List[Product])
async def get_products():
    """Get all available CBD products"""
    try:
        products = await product_service.get_all_products()
        return products
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch products")

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Get specific product by ID"""
    try:
        product = await product_service.get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch product")

# Staking endpoints
@app.get("/api/staking/pools", response_model=List[StakingPool])
async def get_staking_pools():
    """Get all staking pools"""
    try:
        pools = await contract_service.get_staking_pools()
        return pools
    except Exception as e:
        logger.error(f"Error fetching staking pools: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch staking pools")

@app.post("/api/staking/stake")
async def stake_tokens(request: StakeRequest):
    """Stake HEMP tokens"""
    try:
        # Validate request
        if not security_manager.validate_wallet_address(request.wallet_address):
            raise HTTPException(status_code=400, detail="Invalid wallet address")
        
        result = await contract_service.stake_tokens(
            wallet_address=request.wallet_address,
            amount=request.amount,
            pool_id=request.pool_id
        )
        return result
    except Exception as e:
        logger.error(f"Error staking tokens: {e}")
        raise HTTPException(status_code=500, detail="Failed to stake tokens")

@app.post("/api/staking/unstake")
async def unstake_tokens(request: StakeRequest):
    """Unstake HEMP tokens"""
    try:
        if not security_manager.validate_wallet_address(request.wallet_address):
            raise HTTPException(status_code=400, detail="Invalid wallet address")
        
        result = await contract_service.unstake_tokens(
            wallet_address=request.wallet_address,
            amount=request.amount,
            pool_id=request.pool_id
        )
        return result
    except Exception as e:
        logger.error(f"Error unstaking tokens: {e}")
        raise HTTPException(status_code=500, detail="Failed to unstake tokens")

# Governance endpoints
@app.get("/api/governance/proposals", response_model=List[GovernanceProposal])
async def get_governance_proposals():
    """Get all governance proposals"""
    try:
        proposals = await contract_service.get_governance_proposals()
        return proposals
    except Exception as e:
        logger.error(f"Error fetching proposals: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch proposals")

@app.post("/api/governance/vote")
async def vote_on_proposal(request: VoteRequest):
    """Vote on a governance proposal"""
    try:
        if not security_manager.validate_wallet_address(request.wallet_address):
            raise HTTPException(status_code=400, detail="Invalid wallet address")
        
        result = await contract_service.vote_on_proposal(
            wallet_address=request.wallet_address,
            proposal_id=request.proposal_id,
            vote_choice=request.vote_choice,
            weed_amount=request.weed_amount
        )
        return result
    except Exception as e:
        logger.error(f"Error voting on proposal: {e}")
        raise HTTPException(status_code=500, detail="Failed to vote")

# Wallet endpoints
@app.get("/api/wallet/{address}", response_model=WalletInfo)
async def get_wallet_info(address: str):
    """Get wallet information and balances"""
    try:
        if not security_manager.validate_wallet_address(address):
            raise HTTPException(status_code=400, detail="Invalid wallet address")
        
        wallet_info = await wallet_service.get_wallet_info(address)
        return wallet_info
    except Exception as e:
        logger.error(f"Error fetching wallet info: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch wallet info")

# Transaction endpoints
@app.post("/api/transactions/submit")
async def submit_transaction(request: TransactionRequest):
    """Submit a transaction to the Algorand network"""
    try:
        if not security_manager.validate_wallet_address(request.sender):
            raise HTTPException(status_code=400, detail="Invalid sender address")
        
        result = await contract_service.submit_transaction(request)
        return result
    except Exception as e:
        logger.error(f"Error submitting transaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit transaction")

# Prize system endpoints
@app.post("/api/prizes/spin")
async def spin_for_prize(wallet_address: str):
    """Spin for a prize"""
    try:
        if not security_manager.validate_wallet_address(wallet_address):
            raise HTTPException(status_code=400, detail="Invalid wallet address")
        
        result = await contract_service.spin_for_prize(wallet_address)
        return result
    except Exception as e:
        logger.error(f"Error spinning for prize: {e}")
        raise HTTPException(status_code=500, detail="Failed to spin for prize")

@app.get("/api/prizes/winners")
async def get_prize_winners():
    """Get recent prize winners"""
    try:
        winners = await contract_service.get_prize_winners()
        return winners
    except Exception as e:
        logger.error(f"Error fetching prize winners: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch prize winners")

# Background tasks
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting CBD Gold ShopFi API server...")
    
    # Initialize oracle service
    await oracle_service.initialize()
    
    # Start background price updates
    asyncio.create_task(background_price_updates())
    
    logger.info("API server started successfully")

async def background_price_updates():
    """Background task to update prices every 10 seconds"""
    while True:
        try:
            await oracle_service.update_prices()
            await asyncio.sleep(10)
        except Exception as e:
            logger.error(f"Error in background price update: {e}")
            await asyncio.sleep(30)  # Wait longer on error

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting server on {host}:{port} (debug={debug})")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug"
    )