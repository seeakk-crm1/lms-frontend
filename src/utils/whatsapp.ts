import { DEFAULT_PHONE_COUNTRY } from '../constants/phoneCountries';

/** E.164 digits only (no +), suitable for wa.me / api.whatsapp.com */
export type WhatsAppPhoneDigits = string;

export type NormalizePhoneOptions = {
  /** ISO default when local number has no country code (default: workspace IN +91) */
  defaultCountryDialCode?: string;
};

const DEFAULT_DIAL =
  DEFAULT_PHONE_COUNTRY.dialCode.replace(/\D/g, '') || '91';

const MIN_NATIONAL_LENGTH = 8;
const MAX_E164_LENGTH = 15;

/** Strip to digits only — rejects injection via non-numeric characters in URLs. */
export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/**
 * Normalize a phone string for WhatsApp deep links.
 * Returns null when the number cannot be represented safely.
 */
export const normalizePhoneForWhatsApp = (
  raw: string | null | undefined,
  options: NormalizePhoneOptions = {},
): WhatsAppPhoneDigits | null => {
  if (!raw || typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  const defaultCountry = digitsOnly(options.defaultCountryDialCode || DEFAULT_DIAL);
  let digits = digitsOnly(trimmed);

  if (!digits) return null;

  // Local numbers often start with 0 — drop trunk prefix before country code.
  if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.replace(/^0+/, '');
  }

  // Already includes country code (e.g. 91xxxxxxxxxx or +91…)
  if (digits.length > 10) {
    return isValidWhatsAppDigits(digits) ? digits : null;
  }

  // 10-digit local (India-style) → prepend default country
  if (digits.length >= MIN_NATIONAL_LENGTH && digits.length <= 10 && defaultCountry) {
    const combined = `${defaultCountry}${digits}`;
    return isValidWhatsAppDigits(combined) ? combined : null;
  }

  return isValidWhatsAppDigits(digits) ? digits : null;
};

export const isValidWhatsAppDigits = (digits: string): boolean => {
  if (!digits || digits.length < MIN_NATIONAL_LENGTH || digits.length > MAX_E164_LENGTH) {
    return false;
  }
  if (!/^\d+$/.test(digits)) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
};

export const buildWhatsAppUrl = (
  e164Digits: WhatsAppPhoneDigits,
  message?: string,
): string => {
  const safeDigits = digitsOnly(e164Digits);
  const base = `https://wa.me/${safeDigits}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
};

export type OpenWhatsAppOptions = NormalizePhoneOptions & {
  message?: string;
};

/**
 * Opens WhatsApp chat in a new tab/window (Web on desktop, app on mobile via wa.me).
 * @returns true when a window was opened
 */
export const openWhatsAppChat = (
  raw: string | null | undefined,
  options: OpenWhatsAppOptions = {},
): boolean => {
  const digits = normalizePhoneForWhatsApp(raw, options);
  if (!digits) return false;

  const url = buildWhatsAppUrl(digits, options.message);
  if (typeof window === 'undefined') return false;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};

/** Mask number for audit logs (privacy). */
export const maskPhoneForAudit = (raw: string | null | undefined): string | null => {
  const digits = normalizePhoneForWhatsApp(raw);
  if (!digits || digits.length < 4) return null;
  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
};
