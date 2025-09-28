#!/usr/bin/env python3
"""Startup script for CBD Gold ShopFi Backend"""

import os
import sys
import asyncio
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from python_backend.config import settings
from python_backend.utils.logger import setup_logging, get_logger

def main():
    """Main startup function"""
    # Setup logging
    setup_logging(
        log_level=settings.log_level,
        log_file=settings.log_file
    )

    logger = get_logger(__name__)
    logger.info("Starting CBD Gold ShopFi Backend...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"Host: {settings.host}:{settings.port}")

    # Import and start the FastAPI app
    try:
        import uvicorn
        from python_backend.main import app

        # Run the server
        uvicorn.run(
            "python_backend.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug and settings.is_development,
            log_level=settings.log_level.lower(),
            access_log=True,
            workers=1 if settings.debug else 4
        )

    except ImportError as e:
        logger.error(f"Failed to import required modules: {e}")
        logger.error("Please install required dependencies: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
