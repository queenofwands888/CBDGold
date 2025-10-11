const ALGOREGEX = /^[A-Z2-7]{58}$/;

export const MAX_TEXT_LENGTH = 500;

export function sanitizeText(value: string, maxLength = MAX_TEXT_LENGTH): string {
  if (!value) return '';
  let sanitized = value.normalize('NFKC');
  sanitized = sanitized.replace(/[\u0000-\u001F\u007F]/g, ' ');
  sanitized = sanitized.replace(/[<>'"`$]/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  sanitized = sanitized.replace(/\s+/g, ' ');
  sanitized = sanitized.trim();
  return sanitized.slice(0, maxLength);
}

export function isValidAlgorandAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  return ALGOREGEX.test(address.trim());
}

export function normalizeTokenInput(raw: string, options?: { allowDecimals?: boolean; maxLength?: number }): string {
  const { allowDecimals = false, maxLength = 18 } = options ?? {};
  if (!raw) return '';
  const cleaned = raw.normalize('NFKC');
  const allowed = allowDecimals ? cleaned.replace(/[^0-9.]/g, '') : cleaned.replace(/[^0-9]/g, '');
  if (!allowDecimals) {
    return allowed.slice(0, maxLength);
  }
  const parts = allowed.split('.');
  if (parts.length === 1) {
    return parts[0].slice(0, maxLength);
  }
  const integer = parts.shift() ?? '';
  const decimals = parts.join('').slice(0, Math.max(0, maxLength - integer.length - 1));
  return `${integer.slice(0, maxLength)}${decimals ? `.${decimals}` : ''}`;
}

export function parsePositiveNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}
