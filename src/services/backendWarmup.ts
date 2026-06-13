import { ENV } from '../config/env';

/**
 * Wake Render (or any cold-hosted API) before the first authenticated API burst.
 * Prevents ERR_CONNECTION_CLOSED on parallel page-load requests that browsers misreport as CORS.
 */
let warmupPromise: Promise<boolean> | null = null;

export const ensureBackendReachable = (): Promise<boolean> => {
  if (warmupPromise) return warmupPromise;

  const healthUrl = `${ENV.SOCKET_URL.replace(/\/$/, '')}/healthz`;
  warmupPromise = fetch(healthUrl, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  })
    .then((response) => response.ok)
    .finally(() => {
      warmupPromise = null;
    });

  return warmupPromise;
};
