import { ENV } from '../config/env';

/**
 * Wake Render (or any cold-hosted API) before the first authenticated API burst.
 * Prevents ERR_CONNECTION_CLOSED on parallel page-load requests that browsers misreport as CORS.
 */
let hasWarmedUp = false;
let warmupPromise: Promise<boolean> | null = null;

export const ensureBackendReachable = (): Promise<boolean> => {
  if (hasWarmedUp) return Promise.resolve(true);
  if (warmupPromise) return warmupPromise;

  console.log('Health Check Started');
  const healthUrl = `${ENV.SOCKET_URL.replace(/\/$/, '')}/healthz`;
  warmupPromise = fetch(healthUrl, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  })
    .then((response) => {
      if (response.ok) {
        hasWarmedUp = true;
      }
      console.log('Health Check Completed');
      return true;
    })
    .catch((error) => {
      console.log('Health Check Completed');
      hasWarmedUp = true; // prevent infinite loops of /healthz spam
      return true; // don't poison the chain
    })
    .finally(() => {
      warmupPromise = null;
    });

  return warmupPromise;
};
