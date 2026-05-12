/**
 * Vite exposes only vars prefixed with VITE_. Normalize URLs (no trailing slash confusion).
 */
const requireEnv = (key: string): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (!value && import.meta.env.PROD) {
    console.error(`[ENV] Missing required build-time var: ${key}`);
  }
  return value || '';
};

/** Strip trailing slashes except for origin-only URLs we join paths to */
export const normalizeApiBaseUrl = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed || '';
};

/** Origin for Socket.IO (no /api). Prefer explicit VITE_BACKEND_URL; else derive from API URL. */
export const resolveBackendOrigin = (): string => {
  const explicit = normalizeApiBaseUrl(requireEnv('VITE_BACKEND_URL'));
  if (explicit) return explicit;

  const api = normalizeApiBaseUrl(requireEnv('VITE_API_URL') || 'http://localhost:5000/api');
  // .../api -> origin; .../api/foo stays .../api/foo -> strip last segment if ends with api - common case is .../api
  return api.replace(/\/api\/?$/, '');
};

const apiUrlRaw = requireEnv('VITE_API_URL');
const API_URL = normalizeApiBaseUrl(apiUrlRaw || 'http://localhost:5000/api');

export const ENV = {
  /** Always ends without trailing slash; paths like `/auth/login` join correctly */
  API_URL,
  /** WebSocket / Engine.IO origin */
  BACKEND_URL: resolveBackendOrigin(),
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};

if (import.meta.env.DEV) {
  console.info('[ENV] API_URL →', ENV.API_URL);
  console.info('[ENV] realtime origin →', ENV.BACKEND_URL);
}
