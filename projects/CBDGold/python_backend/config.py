import os
from typing import List, Optional
from pydantic import BaseSettings, Field
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")
    
    # Algorand Configuration
    algorand_network: str = Field(default="testnet", env="ALGORAND_NETWORK")
    algod_server: str = Field(default="https://testnet-api.algonode.cloud", env="ALGOD_SERVER")
    algod_token: str = Field(default="", env="ALGOD_TOKEN")
    indexer_server: str = Field(default="https://testnet-idx.algonode.cloud", env="INDEXER_SERVER")
    indexer_token: str = Field(default="", env="INDEXER_TOKEN")
    
    # Asset IDs
    hemp_asset_id: int = Field(default=2675148574, env="HEMP_ASSET_ID")
    weed_asset_id: int = Field(default=2676316280, env="WEED_ASSET_ID")
    usdc_asset_id: int = Field(default=31566704, env="USDC_ASSET_ID")
    
    # Contract IDs
    staking_contract_id: int = Field(default=123456789, env="STAKING_CONTRACT_ID")
    governance_contract_id: int = Field(default=123456790, env="GOVERNANCE_CONTRACT_ID")
    prize_contract_id: int = Field(default=123456791, env="PRIZE_CONTRACT_ID")
    
    # API Keys
    coingecko_api_key: Optional[str] = Field(default=None, env="COINGECKO_API_KEY")
    api_secret_key: str = Field(default="dev-secret-key", env="API_SECRET_KEY")
    
    # Database
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    
    # Redis
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    
    # Security
    jwt_secret: str = Field(default="dev-jwt-secret", env="JWT_SECRET")
    encryption_key: str = Field(default="dev-encryption-key", env="ENCRYPTION_KEY")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file: Optional[str] = Field(default=None, env="LOG_FILE")
    
    # CORS
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
        env="ALLOWED_ORIGINS"
    )
    
    # External Services
    hugging_face_token: Optional[str] = Field(default=None, env="HUGGING_FACE_TOKEN")
    pinata_api_key: Optional[str] = Field(default=None, env="PINATA_API_KEY")
    pinata_secret_key: Optional[str] = Field(default=None, env="PINATA_SECRET_KEY")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> any:
            if field_name == 'allowed_origins':
                return [origin.strip() for origin in raw_val.split(',')]
            return cls.json_loads(raw_val)
    
    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"
    
    @property
    def is_testing(self) -> bool:
        return self.environment.lower() == "testing"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Global settings instance
settings = get_settings()