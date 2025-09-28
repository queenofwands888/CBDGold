import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logging(log_level: str = "INFO", log_file: Optional[str] = None) -> None:
    """Setup logging configuration"""
    # Convert string level to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Create formatter
    formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)

    # Setup root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Clear existing handlers
    root_logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # File handler if specified
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_path)
        file_handler.setLevel(numeric_level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    # Suppress noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("aiohttp").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance"""
    return logging.getLogger(name)

class SecurityLogger:
    """Specialized logger for security events"""

    def __init__(self, name: str = "security"):
        self.logger = get_logger(name)

    def log_failed_auth(self, identifier: str, reason: str):
        """Log failed authentication attempt"""
        self.logger.warning(f"Failed authentication - ID: {identifier}, Reason: {reason}")

    def log_rate_limit_hit(self, identifier: str, endpoint: str):
        """Log rate limit violation"""
        self.logger.warning(f"Rate limit exceeded - ID: {identifier}, Endpoint: {endpoint}")

    def log_suspicious_activity(self, identifier: str, activity: str, details: str = ""):
        """Log suspicious activity"""
        self.logger.error(f"Suspicious activity - ID: {identifier}, Activity: {activity}, Details: {details}")

    def log_security_event(self, event_type: str, details: str, severity: str = "info"):
        """Log general security event"""
        if severity == "error":
            self.logger.error(f"Security event [{event_type}]: {details}")
        elif severity == "warning":
            self.logger.warning(f"Security event [{event_type}]: {details}")
        else:
            self.logger.info(f"Security event [{event_type}]: {details}")

# Initialize logging on module import
setup_logging()
