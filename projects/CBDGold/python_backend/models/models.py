from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class TokenType(str, Enum):
    ALGO = "ALGO"
    HEMP = "HEMP"
    WEED = "WEED"
    USDC = "USDC"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"

class VoteChoice(str, Enum):
    YES = "yes"
    NO = "no"
    ABSTAIN = "abstain"

class TokenPrice(BaseModel):
    symbol: str
    price_usd: float
    price_algo: Optional[float] = None
    last_updated: datetime
    source: str
    change_24h: Optional[float] = None

class Product(BaseModel):
    id: int
    name: str
    strain: str
    type: str
    flavor: str
    effects: str
    price_algo: float
    price_usdc: float
    price_hemp: Optional[float] = None
    hemp_earned: int = Field(default=0, description="HEMP tokens earned from purchase")
    potency: str
    terpenes: List[str]
    color: str
    emoji: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    in_stock: bool = True
    category: str = "vape"

class StakingPool(BaseModel):
    id: int
    name: str
    min_stake: int = Field(description="Minimum stake in HEMP tokens")
    discount: float = Field(description="Discount percentage for purchases")
    apy: float = Field(description="Annual percentage yield")
    shipping: str
    benefits: List[str]
    color: str
    total_staked: Optional[int] = 0
    total_stakers: Optional[int] = 0
    is_active: bool = True

class GovernanceProposal(BaseModel):
    id: int
    title: str
    description: str
    status: str
    time_left: str
    weed_required: int = Field(description="Minimum WEED tokens to vote")
    votes_yes: int = 0
    votes_no: int = 0
    votes_abstain: int = 0
    total_votes: int = 0
    created_at: datetime
    ends_at: datetime
    creator: Optional[str] = None

class WalletInfo(BaseModel):
    address: str
    algo_balance: float
    hemp_balance: int
    weed_balance: int
    usdc_balance: float
    staked_hemp: int = 0
    staking_tier: int = 0
    voting_power: float = 0
    last_updated: datetime
    opted_in_assets: List[int] = []

class TransactionRequest(BaseModel):
    sender: str
    transaction_type: str
    amount: Optional[int] = None
    asset_id: Optional[int] = None
    receiver: Optional[str] = None
    app_id: Optional[int] = None
    app_args: Optional[List[str]] = None
    note: Optional[str] = None

class StakeRequest(BaseModel):
    wallet_address: str
    amount: int
    pool_id: int
    action: str = Field(description="'stake' or 'unstake'")

class VoteRequest(BaseModel):
    wallet_address: str
    proposal_id: int
    vote_choice: VoteChoice
    weed_amount: int

class PrizeWinner(BaseModel):
    id: str
    address: str
    prize: str
    label: str
    tier: str
    time: int
    tx_id: Optional[str] = None

class OracleMetadata(BaseModel):
    algo_usd: float
    hemp_usd: float
    weed_usd: Optional[float] = None
    usdc_usd: float = 1.0
    last_updated: datetime
    source: Dict[str, Any]
    is_live: bool = True
    error: Optional[str] = None