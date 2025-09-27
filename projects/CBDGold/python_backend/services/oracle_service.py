import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
import logging
from ..models.models import TokenPrice, OracleMetadata
from ..utils.logger import get_logger

logger = get_logger(__name__)

class OracleService:
    def __init__(self):
        self.prices: Dict[str, TokenPrice] = {}
        self.metadata: Optional[OracleMetadata] = None
        self.last_update = datetime.utcnow()
        self.update_interval = 10  # seconds
        self.session: Optional[aiohttp.ClientSession] = None
        
        # API endpoints
        self.coingecko_url = "https://api.coingecko.com/api/v3/simple/price"
        self.algorand_indexer = "https://testnet-api.algonode.cloud"
        
    async def initialize(self):
        """Initialize the oracle service"""
        self.session = aiohttp.ClientSession()
        await self.update_prices()
        logger.info("Oracle service initialized")
        
    async def health_check(self) -> Dict[str, Any]:
        """Check oracle service health"""
        try:
            age = (datetime.utcnow() - self.last_update).total_seconds()
            is_healthy = age < 60  # Consider unhealthy if no update in 1 minute
            
            return {
                "status": "healthy" if is_healthy else "degraded",
                "last_update": self.last_update.isoformat(),
                "age_seconds": age,
                "prices_available": len(self.prices)
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_token_prices(self) -> Dict[str, TokenPrice]:
        """Get current token prices"""
        if not self.prices or (datetime.utcnow() - self.last_update).total_seconds() > 30:
            await self.update_prices()
        return self.prices
    
    async def get_oracle_metadata(self) -> Optional[OracleMetadata]:
        """Get oracle metadata"""
        return self.metadata
    
    async def update_prices(self):
        """Update all token prices from various sources"""
        try:
            logger.debug("Updating token prices...")
            
            # Fetch ALGO price from CoinGecko
            algo_price = await self._fetch_coingecko_price("algorand")
            
            # Mock HEMP and WEED prices for now
            # In production, these would come from DEX APIs or custom oracles
            hemp_price = 0.000125  # Mock price in USD
            weed_price = 0.15      # Mock price in USD
            usdc_price = 1.0       # USDC is pegged to USD
            
            # Update prices dictionary
            now = datetime.utcnow()
            
            self.prices["ALGO"] = TokenPrice(
                symbol="ALGO",
                price_usd=algo_price,
                last_updated=now,
                source="coingecko"
            )
            
            self.prices["HEMP"] = TokenPrice(
                symbol="HEMP",
                price_usd=hemp_price,
                price_algo=hemp_price / algo_price if algo_price > 0 else 0,
                last_updated=now,
                source="mock"
            )
            
            self.prices["WEED"] = TokenPrice(
                symbol="WEED",
                price_usd=weed_price,
                price_algo=weed_price / algo_price if algo_price > 0 else 0,
                last_updated=now,
                source="mock"
            )
            
            self.prices["USDC"] = TokenPrice(
                symbol="USDC",
                price_usd=usdc_price,
                price_algo=usdc_price / algo_price if algo_price > 0 else 0,
                last_updated=now,
                source="fixed"
            )
            
            # Update metadata
            self.metadata = OracleMetadata(
                algo_usd=algo_price,
                hemp_usd=hemp_price,
                weed_usd=weed_price,
                usdc_usd=usdc_price,
                last_updated=now,
                source={
                    "backend": True,
                    "fallback": False,
                    "providers": ["coingecko", "mock"]
                },
                is_live=True
            )
            
            self.last_update = now
            logger.debug(f"Updated prices: ALGO=${algo_price:.4f}, HEMP=${hemp_price:.6f}")
            
        except Exception as e:
            logger.error(f"Error updating prices: {e}")
            # Create fallback metadata on error
            self.metadata = OracleMetadata(
                algo_usd=0.25,  # Fallback price
                hemp_usd=0.000125,
                weed_usd=0.15,
                usdc_usd=1.0,
                last_updated=datetime.utcnow(),
                source={
                    "backend": False,
                    "fallback": True,
                    "error": str(e)
                },
                is_live=False,
                error=str(e)
            )
    
    async def _fetch_coingecko_price(self, coin_id: str) -> float:
        """Fetch price from CoinGecko API"""
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            params = {
                "ids": coin_id,
                "vs_currencies": "usd"
            }
            
            async with self.session.get(self.coingecko_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return float(data[coin_id]["usd"])
                else:
                    logger.warning(f"CoinGecko API returned status {response.status}")
                    return 0.25  # Fallback ALGO price
                    
        except Exception as e:
            logger.error(f"Error fetching {coin_id} price from CoinGecko: {e}")
            return 0.25  # Fallback price
    
    async def close(self):
        """Close the oracle service"""
        if self.session:
            await self.session.close()
            logger.info("Oracle service closed")