/**
 * Canonical public site URL for Seeakk CRM (marketing + app shell).
 * Override at build time with VITE_APP_URL when deploying previews.
 */

export const PRODUCTION_APP_URL = 'https://www.seeakk.com';

export const resolveAppUrl = (): string => {
  const fromEnv = (import.meta.env.VITE_APP_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  return PRODUCTION_APP_URL;
};
