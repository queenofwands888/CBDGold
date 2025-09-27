import asyncio
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
from algosdk.v2client import algod
from algosdk import transaction, account, mnemonic
from ..models.models import (
    StakingPool, GovernanceProposal, TransactionRequest,
    PrizeWinner, TransactionStatus
)
from ..utils.logger import get_logger

logger = get_logger(__name__)

class ContractService:
    def __init__(self):
        # Algorand TestNet configuration
        self.algod_address = "https://testnet-api.algonode.cloud"
        self.algod_token = ""
        self.algod_client = algod.AlgodClient(self.algod_token, self.algod_address)
        
        # Mock contract IDs (replace with actual deployed contracts)
        self.staking_app_id = 123456789
        self.governance_app_id = 123456790
        self.prize_app_id = 123456791
        
        # Asset IDs
        self.hemp_asset_id = 2675148574
        self.weed_asset_id = 2676316280
        self.usdc_asset_id = 31566704
        
        # Mock data
        self.mock_staking_pools = [
            StakingPool(
                id=1,
                name="Bronze Pool",
                min_stake=10_000_000,  # 10M HEMP
                discount=5.0,
                apy=12.0,
                shipping="Standard",
                benefits=["5% discount", "12% APY", "Standard shipping"],
                color="from-orange-400 to-orange-600",
                total_staked=50_000_000,
                total_stakers=125
            ),
            StakingPool(
                id=2,
                name="Silver Pool",
                min_stake=100_000_000,  # 100M HEMP
                discount=10.0,
                apy=15.0,
                shipping="Express",
                benefits=["10% discount", "15% APY", "Express shipping", "Priority support"],
                color="from-gray-400 to-gray-600",
                total_staked=200_000_000,
                total_stakers=85
            ),
            StakingPool(
                id=3,
                name="Gold Pool",
                min_stake=1_000_000_000,  # 1B HEMP
                discount=15.0,
                apy=20.0,
                shipping="Next Day",
                benefits=["15% discount", "20% APY", "Next day shipping", "VIP support", "Exclusive products"],
                color="from-yellow-400 to-yellow-600",
                total_staked=500_000_000,
                total_stakers=42
            )
        ]
        
        self.mock_proposals = [
            GovernanceProposal(
                id=1,
                title="Increase Staking Rewards",
                description="Proposal to increase staking rewards by 2% across all pools to incentivize more participation.",
                status="Active",
                time_left="5 days",
                weed_required=1000,
                votes_yes=15420,
                votes_no=3240,
                votes_abstain=580,
                total_votes=19240,
                created_at=datetime.utcnow() - timedelta(days=2),
                ends_at=datetime.utcnow() + timedelta(days=5)
            ),
            GovernanceProposal(
                id=2,
                title="New Product Line: Edibles",
                description="Vote on introducing a new line of CBD edibles to the ShopFi platform.",
                status="Active",
                time_left="12 days",
                weed_required=500,
                votes_yes=8750,
                votes_no=2100,
                votes_abstain=450,
                total_votes=11300,
                created_at=datetime.utcnow() - timedelta(days=1),
                ends_at=datetime.utcnow() + timedelta(days=12)
            )
        ]
        
        self.prize_winners: List[PrizeWinner] = []
    
    async def health_check(self) -> Dict[str, Any]:
        """Check contract service health"""
        try:
            # Try to get network status
            status = self.algod_client.status()
            return {
                "status": "healthy",
                "network": "testnet",
                "last_round": status.get("last-round", 0),
                "contracts_loaded": 3
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_staking_pools(self) -> List[StakingPool]:
        """Get all staking pools"""
        return self.mock_staking_pools
    
    async def stake_tokens(self, wallet_address: str, amount: int, pool_id: int) -> Dict[str, Any]:
        """Stake HEMP tokens in a pool"""
        try:
            # Find the pool
            pool = next((p for p in self.mock_staking_pools if p.id == pool_id), None)
            if not pool:
                raise ValueError(f"Pool {pool_id} not found")
            
            if amount < pool.min_stake:
                raise ValueError(f"Amount {amount} below minimum stake {pool.min_stake}")
            
            # Simulate transaction
            tx_id = self._generate_mock_tx_id()
            
            # Update pool stats
            pool.total_staked += amount
            pool.total_stakers += 1  # Simplified - would check if new staker
            
            logger.info(f"Staked {amount} HEMP in pool {pool_id} for {wallet_address}")
            
            return {
                "status": "success",
                "tx_id": tx_id,
                "amount_staked": amount,
                "pool_id": pool_id,
                "new_tier": self._calculate_tier(amount)
            }
            
        except Exception as e:
            logger.error(f"Error staking tokens: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def unstake_tokens(self, wallet_address: str, amount: int, pool_id: int) -> Dict[str, Any]:
        """Unstake HEMP tokens from a pool"""
        try:
            # Find the pool
            pool = next((p for p in self.mock_staking_pools if p.id == pool_id), None)
            if not pool:
                raise ValueError(f"Pool {pool_id} not found")
            
            # Simulate transaction
            tx_id = self._generate_mock_tx_id()
            
            # Update pool stats
            pool.total_staked = max(0, pool.total_staked - amount)
            
            logger.info(f"Unstaked {amount} HEMP from pool {pool_id} for {wallet_address}")
            
            return {
                "status": "success",
                "tx_id": tx_id,
                "amount_unstaked": amount,
                "pool_id": pool_id
            }
            
        except Exception as e:
            logger.error(f"Error unstaking tokens: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_governance_proposals(self) -> List[GovernanceProposal]:
        """Get all governance proposals"""
        return self.mock_proposals
    
    async def vote_on_proposal(self, wallet_address: str, proposal_id: int, 
                             vote_choice: str, weed_amount: int) -> Dict[str, Any]:
        """Vote on a governance proposal"""
        try:
            # Find the proposal
            proposal = next((p for p in self.mock_proposals if p.id == proposal_id), None)
            if not proposal:
                raise ValueError(f"Proposal {proposal_id} not found")
            
            if weed_amount < proposal.weed_required:
                raise ValueError(f"Insufficient WEED tokens. Required: {proposal.weed_required}")
            
            # Update vote counts
            if vote_choice.lower() == "yes":
                proposal.votes_yes += weed_amount
            elif vote_choice.lower() == "no":
                proposal.votes_no += weed_amount
            else:
                proposal.votes_abstain += weed_amount
            
            proposal.total_votes += weed_amount
            
            # Simulate transaction
            tx_id = self._generate_mock_tx_id()
            
            logger.info(f"Vote recorded: {vote_choice} on proposal {proposal_id} with {weed_amount} WEED")
            
            return {
                "status": "success",
                "tx_id": tx_id,
                "vote_choice": vote_choice,
                "weed_used": weed_amount,
                "proposal_id": proposal_id
            }
            
        except Exception as e:
            logger.error(f"Error voting on proposal: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def spin_for_prize(self, wallet_address: str) -> Dict[str, Any]:
        """Spin for a prize"""
        try:
            # Simple prize logic
            rand = random.random()
            
            if rand < 0.01:  # 1% chance for legendary
                prize_type = "legendary"
                prize_name = "Physical CBD Gold Vape"
                prize_desc = "Premium vape device shipped to your door"
            elif rand < 0.05:  # 4% chance for rare
                prize_type = "rare"
                prize_name = "10,000 HEMP Tokens"
                prize_desc = "Instant HEMP token reward"
            elif rand < 0.25:  # 20% chance for common
                prize_type = "common"
                prize_name = "1,000 HEMP Tokens"
                prize_desc = "Small token reward"
            else:  # 75% chance for nothing
                prize_type = "none"
                prize_name = "Better luck next time!"
                prize_desc = "No prize this time, try again soon"
            
            # Record winner if they won something
            if prize_type != "none":
                winner = PrizeWinner(
                    id=f"prize_{random.randint(10000, 99999)}",
                    address=wallet_address,
                    prize=prize_name,
                    label=prize_desc,
                    tier=prize_type,
                    time=int(datetime.utcnow().timestamp()),
                    tx_id=self._generate_mock_tx_id()
                )
                self.prize_winners.insert(0, winner)
                # Keep only last 50 winners
                self.prize_winners = self.prize_winners[:50]
            
            return {
                "status": "success",
                "prize_type": prize_type,
                "prize_name": prize_name,
                "prize_description": prize_desc,
                "won_prize": prize_type != "none"
            }
            
        except Exception as e:
            logger.error(f"Error spinning for prize: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_prize_winners(self) -> List[PrizeWinner]:
        """Get recent prize winners"""
        return self.prize_winners[:25]  # Return last 25 winners
    
    async def submit_transaction(self, request: TransactionRequest) -> Dict[str, Any]:
        """Submit a transaction to the network"""
        try:
            # This would implement actual transaction submission
            # For now, just simulate success/failure
            
            tx_id = self._generate_mock_tx_id()
            
            # Simulate occasional failures
            if random.random() < 0.05:  # 5% failure rate
                return {
                    "status": "failed",
                    "error": "Transaction simulation failed"
                }
            
            return {
                "status": "confirmed",
                "tx_id": tx_id,
                "block": random.randint(1000000, 2000000)
            }
            
        except Exception as e:
            logger.error(f"Error submitting transaction: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _generate_mock_tx_id(self) -> str:
        """Generate a mock transaction ID"""
        return "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", k=52))
    
    def _calculate_tier(self, staked_amount: int) -> int:
        """Calculate staking tier based on amount"""
        if staked_amount >= 1_000_000_000:  # 1B HEMP
            return 3  # Gold
        elif staked_amount >= 100_000_000:  # 100M HEMP
            return 2  # Silver
        elif staked_amount >= 10_000_000:   # 10M HEMP
            return 1  # Bronze
        else:
            return 0  # None