// Security utilities for input validation and sanitization
// 🔒 CBDGold Security Module

import { secureStorage } from './storage';
import { logger } from './logger';

/**
 * Validates Algorand wallet addresses
 * @param address - The wallet address to validate
 * @returns boolean - True if valid Algorand address
 */
export const validateWalletAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;

  // Algorand addresses are 58 characters, base32 encoded
  const algorandAddressRegex = /^[A-Z2-7]{58}$/;
  return algorandAddressRegex.test(address);
};

/**
 * Sanitizes user input to prevent XSS and injection attacks
 * @param input - The user input to sanitize
 * @returns string - Sanitized input
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
};

/**
 * Validates numeric input for staking amounts
 * @param value - The numeric value to validate
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @returns Object with isValid boolean and error message
 */
export const validateNumericInput = (
  value: string | number,
  min?: number,
  max?: number
): { isValid: boolean; error?: string; sanitizedValue?: number } => {
  // Convert to string for parsing
  const strValue = String(value).trim();

  // Check if empty
  if (!strValue) {
    return { isValid: false, error: 'Value is required' };
  }

  // Check if numeric
  const numValue = Number(strValue);
  if (isNaN(numValue) || !isFinite(numValue)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  // Check if negative
  if (numValue < 0) {
    return { isValid: false, error: 'Value cannot be negative' };
  }

  // Check minimum
  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `Value must be at least ${min.toLocaleString()}` };
  }

  // Check maximum
  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `Value cannot exceed ${max.toLocaleString()}` };
  }

  return { isValid: true, sanitizedValue: numValue };
};

/**
 * Validates shipping address input
 * @param address - The shipping address to validate
 * @returns Object with isValid boolean and error message
 */
export const validateShippingAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address || typeof address !== 'string') {
    return { isValid: false, error: 'Address is required' };
  }

  const sanitized = sanitizeInput(address);

  if (sanitized.length < 10) {
    return { isValid: false, error: 'Address must be at least 10 characters' };
  }

  if (sanitized.length > 500) {
    return { isValid: false, error: 'Address is too long (max 500 characters)' };
  }

  // Basic address validation - should contain some alphanumeric content
  const hasAlphanumeric = /[a-zA-Z0-9]/.test(sanitized);
  if (!hasAlphanumeric) {
    return { isValid: false, error: 'Address must contain valid characters' };
  }

  return { isValid: true };
};

/**
 * Validates email addresses
 * @param email - The email to validate
 * @returns Object with isValid boolean and error message
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitized = sanitizeInput(email.toLowerCase());

  // Basic email regex - not perfect but good enough for security
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
};

/**
 * Rate limiting for API calls (client-side)
 * @param key - Unique key for this rate limit
 * @param limit - Number of calls allowed
 * @param window - Time window in milliseconds
 * @returns boolean - True if call is allowed
 */
export const isRateLimited = (key: string, limit: number = 10, windowMs: number = 60000): boolean => {
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (limit <= 0) {
    return true;
  }

  const now = Date.now();
  const sanitizedKey = key.replace(/[^a-zA-Z0-9:_-]/g, '').toLowerCase() || 'default';
  const bucketLimit = Math.max(limit, 1);
  const sanitizedWindow = Math.max(windowMs, 0);
  const legacyStorageKey = `rate_limit_${sanitizedKey}`;

  const allBuckets = secureStorage.getJSON<Record<string, number[]>>('rate_limits') ?? {};
  const rawTimestamps = Array.isArray(allBuckets[sanitizedKey]) ? allBuckets[sanitizedKey] : [];
  let timestamps = rawTimestamps.filter(ts => typeof ts === 'number');

  if (typeof window !== 'undefined') {
    try {
      const legacyPayload = window.localStorage?.getItem(legacyStorageKey);
      if (legacyPayload) {
        const legacy = JSON.parse(legacyPayload);
        if (Array.isArray(legacy)) {
          timestamps = timestamps.concat(legacy.filter((ts: unknown) => typeof ts === 'number'));
        }
        window.localStorage?.removeItem(legacyStorageKey);
      }
    } catch (error) {
      logger.warn('Failed to migrate legacy rate limit state', { key: sanitizedKey, error });
    }
  }

  const recentCalls = sanitizedWindow === 0
    ? []
    : timestamps.filter(timestamp => now - timestamp < sanitizedWindow);

  if (recentCalls.length >= bucketLimit) {
    allBuckets[sanitizedKey] = recentCalls.slice(0, bucketLimit);
    if (!secureStorage.setJSON('rate_limits', allBuckets, { maxBytes: 12_288 })) {
      logger.warn('Failed to persist rate limit bucket after cap', { key: sanitizedKey });
    }
    return true;
  }

  recentCalls.push(now);
  allBuckets[sanitizedKey] = recentCalls.slice(-bucketLimit);
  if (!secureStorage.setJSON('rate_limits', allBuckets, { maxBytes: 12_288 })) {
    logger.warn('Failed to persist updated rate limit bucket', { key: sanitizedKey });
  }

  return false;
};

/**
 * Secure logger that doesn't expose sensitive data in production
 */
/**
 * Security headers validation for API responses
 * @param response - Fetch API response object
 * @returns boolean - True if response passes security checks
 */
export const validateApiResponse = (response: Response): boolean => {
  // Check if response is from expected domain
  const url = new URL(response.url);
  const allowedDomains = ['localhost', '127.0.0.1', 'cbdgold.com']; // Add your production domains

  const isDomainAllowed = allowedDomains.some(domain =>
    url.hostname === domain || url.hostname.endsWith(`.${domain}`)
  );

  if (!isDomainAllowed) {
    logger.error('API response from unauthorized domain', url.hostname);
    return false;
  }

  return true;
};

// Export default security configuration
export const SecurityConfig = {
  MAX_STAKING_AMOUNT: 1000000000000, // 1 trillion HEMP max
  MIN_STAKING_AMOUNT: 1,
  MAX_INPUT_LENGTH: 1000,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_CALLS: 10,
  ALLOWED_NETWORKS: ['localnet', 'testnet', 'mainnet'],
  REQUIRED_WALLET_ADDRESS_LENGTH: 58
} as const;
