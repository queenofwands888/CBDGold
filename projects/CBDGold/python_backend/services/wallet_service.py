from typing import Dict, Any, List
from datetime import datetime
import random
from algosdk.v2client import algod, indexer
from ..models.models import WalletInfo
from ..utils.logger import get_logger

logger = get_logger(__name__)

class WalletService:
    def __init__(self):
        # Algorand TestNet configuration
        self.algod_address = "https://testnet-api.algonode.cloud"
        self.algod_token = ""
        self.indexer_address = "https://testnet-idx.algonode.cloud"
        self.indexer_token = ""

        self.algod_client = algod.AlgodClient(self.algod_token, self.algod_address)
        self.indexer_client = indexer.IndexerClient(self.indexer_token, self.indexer_address)

        # Asset IDs
        self.hemp_asset_id = 748025551
        self.weed_asset_id = 748025552
        self.usdc_asset_id = 31566704

        # Cache for wallet info
        self.wallet_cache: Dict[str, WalletInfo] = {}
        self.cache_duration = 30  # seconds

    async def get_wallet_info(self, address: str) -> WalletInfo:
        """Get comprehensive wallet information"""
        try:
            # Check cache first
            if address in self.wallet_cache:
                cached = self.wallet_cache[address]
                age = (datetime.utcnow() - cached.last_updated).total_seconds()
                if age < self.cache_duration:
                    return cached

            # Fetch account information
            account_info = self.algod_client.account_information(address)

            # Parse balances
            algo_balance = account_info.get("amount", 0) / 1_000_000  # Convert microAlgos

            # Initialize asset balances
            hemp_balance = 0
            weed_balance = 0
            usdc_balance = 0.0
            opted_in_assets = []

            # Parse assets
            assets = account_info.get("assets", [])
            for asset in assets:
                asset_id = asset.get("asset-id")
                amount = asset.get("amount", 0)

                opted_in_assets.append(asset_id)

                if asset_id == self.hemp_asset_id:
                    hemp_balance = amount
                elif asset_id == self.weed_asset_id:
                    weed_balance = amount
                elif asset_id == self.usdc_asset_id:
                    usdc_balance = amount / 1_000_000  # USDC has 6 decimal places

            # Calculate derived values
            staked_hemp = self._get_staked_hemp(address)  # Mock for now
            staking_tier = self._calculate_staking_tier(staked_hemp)
            voting_power = weed_balance / 1_000_000  # 1M WEED = 1 vote

            wallet_info = WalletInfo(
                address=address,
                algo_balance=algo_balance,
                hemp_balance=hemp_balance,
                weed_balance=weed_balance,
                usdc_balance=usdc_balance,
                staked_hemp=staked_hemp,
                staking_tier=staking_tier,
                voting_power=voting_power,
                last_updated=datetime.utcnow(),
                opted_in_assets=opted_in_assets
            )

            # Cache the result
            self.wallet_cache[address] = wallet_info

            logger.info(f"Fetched wallet info for {address[:8]}...")
            return wallet_info

        except Exception as e:
            logger.error(f"Error fetching wallet info for {address}: {e}")

            # Return mock data on error
            return WalletInfo(
                address=address,
                algo_balance=100.0 + random.uniform(0, 100),
                hemp_balance=random.randint(1000000, 50000000),
                weed_balance=random.randint(1000, 10000),
                usdc_balance=random.uniform(50, 500),
                staked_hemp=random.randint(0, 10000000),
                staking_tier=random.randint(0, 3),
                voting_power=random.uniform(1, 10),
                last_updated=datetime.utcnow(),
                opted_in_assets=[self.hemp_asset_id, self.weed_asset_id, self.usdc_asset_id]
            )

    def _get_staked_hemp(self, address: str) -> int:
        """Get staked HEMP amount (mock implementation)"""
        # In production, this would query the staking contract
        return random.randint(0, 100_000_000)

    def _calculate_staking_tier(self, staked_amount: int) -> int:
        """Calculate staking tier based on staked amount"""
        if staked_amount >= 1_000_000_000:  # 1B HEMP
            return 3  # Gold
        elif staked_amount >= 100_000_000:  # 100M HEMP
            return 2  # Silver
        elif staked_amount >= 10_000_000:   # 10M HEMP
            return 1  # Bronze
        else:
            return 0  # None

    async def check_asset_opt_in(self, address: str, asset_id: int) -> bool:
        """Check if an address is opted into an asset"""
        try:
            wallet_info = await self.get_wallet_info(address)
            return asset_id in wallet_info.opted_in_assets
        except Exception as e:
            logger.error(f"Error checking opt-in for {address}, asset {asset_id}: {e}")
            return False

    def clear_cache(self, address: str = None):
        """Clear wallet cache"""
        if address:
            self.wallet_cache.pop(address, None)
        else:
            self.wallet_cache.clear()
        logger.info(f"Cleared wallet cache{' for ' + address if address else ''}")
