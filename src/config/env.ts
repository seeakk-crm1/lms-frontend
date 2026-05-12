/**
 * Vite exposes only vars prefixed with VITE_.
 *
 * Architecture:
 * - REST: VITE_API_URL → https://backend.example.com/api
 * - Socket.IO origin (no /api): VITE_SOCKET_URL | VITE_BACKEND_URL | derived from API URL
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

/**
 * Socket.IO connects to the HTTP **origin** only, path `/socket.io` — never `/api`.
 * Priority: VITE_SOCKET_URL → VITE_BACKEND_URL → strip `/api` from VITE_API_URL
 */
export const resolveSocketOrigin = (): string => {
  const explicitSocket = normalizeOriginUrl(requireEnv('VITE_SOCKET_URL'));
  if (explicitSocket) return explicitSocket;

  const legacyBackend = normalizeOriginUrl(requireEnv('VITE_BACKEND_URL'));
  if (legacyBackend) return legacyBackend;

  const api = normalizeOriginUrl(requireEnv('VITE_API_URL') || defaultLocalApi);
  return api.replace(/\/api\/?$/, '');
};

const apiUrlRaw = requireEnv('VITE_API_URL');
const API_URL = normalizeOriginUrl(apiUrlRaw || defaultLocalApi);

const SOCKET_ORIGIN = resolveSocketOrigin();

export const ENV = {
  API_URL,
  /** HTTP origin for Engine.IO (same as legacy BACKEND_URL / socket URL) */
  SOCKET_URL: SOCKET_ORIGIN,
  /** @deprecated use SOCKET_URL — kept for any older imports */
  BACKEND_URL: SOCKET_ORIGIN,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};

const logEnv = (): void => {
  const mode = import.meta.env.PROD ? 'production' : 'development';
  console.info(`[ENV:${mode}] VITE_API_URL → ${ENV.API_URL}`);
  console.info(`[ENV:${mode}] Socket.IO origin → ${ENV.SOCKET_URL}`, {
    sources: {
      VITE_SOCKET_URL: requireEnv('VITE_SOCKET_URL') ? '(set)' : '(unset)',
      VITE_BACKEND_URL: requireEnv('VITE_BACKEND_URL') ? '(set)' : '(unset)',
      derivedFromApi: !requireEnv('VITE_SOCKET_URL') && !requireEnv('VITE_BACKEND_URL'),
    },
  });
};

if (import.meta.env.DEV) {
  logEnv();
}

if (import.meta.env.PROD) {
  logEnv();
}
