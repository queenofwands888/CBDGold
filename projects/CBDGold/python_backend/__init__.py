"""CBD Gold ShopFi Python Backend

A comprehensive Python backend for the CBD Gold ShopFi DeFi platform.
Provides APIs for product management, staking, governance, and wallet integration.
"""

__version__ = "1.0.0"
__author__ = "CBD Gold Team"

from .utils.logger import setup_logging, get_logger

# Initialize logging
setup_logging()

__all__ = ["setup_logging", "get_logger"]
