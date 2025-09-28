import re
import hashlib
import hmac
import secrets
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json
from .logger import get_logger

logger = get_logger(__name__)

class SecurityManager:
    def __init__(self):
        self.rate_limit_store: Dict[str, Dict[str, Any]] = {}
        self.api_key_hash = None  # Set this in production

        # Security patterns
        self.algorand_address_pattern = re.compile(r'^[A-Z2-7]{58}$')
        self.tx_id_pattern = re.compile(r'^[A-Z2-7]{52}$')

    def validate_wallet_address(self, address: str) -> bool:
        """Validate Algorand wallet address format"""
        if not address or not isinstance(address, str):
            return False

        # Check basic format
        if not self.algorand_address_pattern.match(address):
            return False

        # Additional validation could include checksum verification
        return True

    def validate_transaction_id(self, tx_id: str) -> bool:
        """Validate Algorand transaction ID format"""
        if not tx_id or not isinstance(tx_id, str):
            return False

        return self.tx_id_pattern.match(tx_id) is not None

    def sanitize_input(self, input_str: str, max_length: int = 1000) -> str:
        """Sanitize user input"""
        if not isinstance(input_str, str):
            return ""

        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\'\/\\]', '', input_str)

        # Limit length
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]

        return sanitized.strip()

    def validate_numeric_input(self, value: Any, min_val: float = 0, max_val: float = float('inf')) -> bool:
        """Validate numeric input"""
        try:
            num_val = float(value)
            return min_val <= num_val <= max_val
        except (ValueError, TypeError):
            return False

    def is_rate_limited(self, identifier: str, max_requests: int = 60, window_seconds: int = 60) -> bool:
        """Check if an identifier is rate limited"""
        now = datetime.utcnow()

        # Clean old entries
        self._clean_rate_limit_store(now, window_seconds)

        # Check current rate limit
        if identifier not in self.rate_limit_store:
            self.rate_limit_store[identifier] = {
                'count': 1,
                'window_start': now
            }
            return False

        entry = self.rate_limit_store[identifier]

        # Check if we're in a new window
        if (now - entry['window_start']).total_seconds() >= window_seconds:
            entry['count'] = 1
            entry['window_start'] = now
            return False

        # Increment count
        entry['count'] += 1

        # Check if over limit
        if entry['count'] > max_requests:
            logger.warning(f"Rate limit exceeded for {identifier}")
            return True

        return False

    def _clean_rate_limit_store(self, now: datetime, window_seconds: int):
        """Clean old rate limit entries"""
        expired_keys = []

        for key, entry in self.rate_limit_store.items():
            if (now - entry['window_start']).total_seconds() > window_seconds * 2:
                expired_keys.append(key)

        for key in expired_keys:
            del self.rate_limit_store[key]

    def generate_secure_token(self, length: int = 32) -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(length)

    def hash_data(self, data: str, salt: Optional[str] = None) -> str:
        """Hash data with optional salt"""
        if salt is None:
            salt = secrets.token_hex(16)

        return hashlib.pbkdf2_hmac('sha256', data.encode(), salt.encode(), 100000).hex()

    def verify_hmac_signature(self, message: str, signature: str, secret: str) -> bool:
        """Verify HMAC signature"""
        try:
            expected = hmac.new(
                secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected, signature)
        except Exception as e:
            logger.error(f"Error verifying HMAC signature: {e}")
            return False

    def log_security_event(self, event_type: str, details: Dict[str, Any], severity: str = "info"):
        """Log security events"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "severity": severity,
            "details": details
        }

        if severity == "error":
            logger.error(f"Security event: {json.dumps(log_entry)}")
        elif severity == "warning":
            logger.warning(f"Security event: {json.dumps(log_entry)}")
        else:
            logger.info(f"Security event: {json.dumps(log_entry)}")
