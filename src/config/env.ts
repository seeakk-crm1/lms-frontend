import { resolveAppUrl } from './appDomains';

/**
 * Vite exposes only vars prefixed with VITE_.
 *
 * Architecture:
 * - Public site: VITE_APP_URL → https://www.seeakk.com (fallback in appDomains.ts)
 * - REST: VITE_API_URL → https://backend.example.com/api
 * - Socket.IO origin (no /api): VITE_SOCKET_URL | VITE_BACKEND_URL | derived from API URL
 * - Optional: VITE_SOCKET_TRANSPORTS=polling | websocket — override auto behavior (Render `*.onrender.com` defaults to polling-only)
 * - Optional: VITE_SOCKET_REMEMBER_UPGRADE=false — in dev, disable skipping polling after a prior WS success
 */
const requireEnv = (key: string): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (!value && import.meta.env.PROD) {
    console.error(`[ENV] Missing build-time var: ${key}`);
  }
  return value || '';
};

export const normalizeOriginUrl = (raw: string): string => raw.trim().replace(/\/+$/, '');

const defaultLocalApi = 'http://localhost:5000/api';

const getOptionalEnv = (key: string): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return value || '';
};

/**
 * Socket.IO connects to the HTTP **origin** only, path `/socket.io` — never `/api`.
 * Priority: VITE_SOCKET_URL → VITE_BACKEND_URL → strip `/api` from VITE_API_URL
 */
export const resolveSocketOrigin = (): string => {
  const explicitSocket = normalizeOriginUrl(getOptionalEnv('VITE_SOCKET_URL'));
  if (explicitSocket) return explicitSocket;

  const legacyBackend = normalizeOriginUrl(getOptionalEnv('VITE_BACKEND_URL'));
  if (legacyBackend) return legacyBackend;

  const api = normalizeOriginUrl(requireEnv('VITE_API_URL') || defaultLocalApi);
  return api.replace(/\/api\/?$/, '');
};

const apiUrlRaw = requireEnv('VITE_API_URL');
const API_URL = normalizeOriginUrl(apiUrlRaw || defaultLocalApi);

const SOCKET_ORIGIN = resolveSocketOrigin();

export const ENV = {
  /** Canonical public frontend origin (marketing + SPA) */
  APP_URL: resolveAppUrl(),
  API_URL,
  /** HTTP origin for Engine.IO (same as legacy BACKEND_URL / socket URL) */
  SOCKET_URL: SOCKET_ORIGIN,
  /** @deprecated use SOCKET_URL — kept for any older imports */
  BACKEND_URL: SOCKET_ORIGIN,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};

const logEnv = (): void => {
  // Console logging disabled for production environment setup
};

if (import.meta.env.DEV) {
  // logEnv();
}
