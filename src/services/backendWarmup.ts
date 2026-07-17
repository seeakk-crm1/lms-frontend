import { ENV } from '../config/env';

/**
 * Wake Render (or any cold-hosted API) before the first authenticated API burst.
 * Prevents ERR_CONNECTION_CLOSED on parallel page-load requests that browsers misreport as CORS.
 */
let hasWarmedUp = false;
let warmupPromise: Promise<boolean> | null = null;
let failedAttempts = 0;
let nextRetryAt = 0;

const MAX_SILENT_HEALTH_ATTEMPTS = 4;
const BASE_BACKOFF_MS = 5_000;

export const ensureBackendReachable = (): Promise<boolean> => {
  if (hasWarmedUp) return Promise.resolve(true);
  if (warmupPromise) return warmupPromise;
  if (failedAttempts >= MAX_SILENT_HEALTH_ATTEMPTS) return Promise.resolve(false);
  if (Date.now() < nextRetryAt) return Promise.resolve(false);

  const healthUrl = `${ENV.SOCKET_URL.replace(/\/$/, '')}/healthz`;
  warmupPromise = fetch(healthUrl, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Backend health check failed with HTTP ${response.status}`);
      }
      hasWarmedUp = true;
      failedAttempts = 0;
      nextRetryAt = 0;
      return true;
    })
    .catch((error) => {
      failedAttempts += 1;
      nextRetryAt = Date.now() + BASE_BACKOFF_MS * 2 ** Math.min(failedAttempts - 1, 4);
      if (failedAttempts === 1) {
        console.warn('[Backend health] Server is not reachable. Retrying silently with backoff.', {
          healthUrl,
          message: error?.message || String(error),
        });
      }
      return false;
    })
    .finally(() => {
      warmupPromise = null;
    });

  return warmupPromise;
};
