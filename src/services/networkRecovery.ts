/**
 * Centralized network-awareness service.
 *
 * Responsibilities:
 * 1. Track online/offline state using browser events.
 * 2. On restoration, fire one controlled auth recovery (token refresh if needed + socket reconnect).
 * 3. Prevent duplicate recovery attempts with a single in-flight guard.
 * 4. Never log the user out due to temporary network loss.
 *
 * Architecture notes:
 * - This module is imported once at startup by the App root.
 * - It never modifies auth state directly — it delegates to authToken and realtime.
 * - All actions are idempotent: safe to call multiple times.
 */

import { resolveValidAccessToken, refreshAccessToken, isRefreshAuthFailure } from './authToken';
import { getSocket } from './realtime';

let recoveryInFlight = false;
let offlineToastShown = false;

const ONLINE_RECOVERY_DELAY_MS = 800; // brief stabilization window after "online" fires

/**
 * Attempt to restore auth + socket state after network is back.
 * Called at most once per network restoration event.
 */
const onNetworkRestored = async (): Promise<void> => {
  if (recoveryInFlight) return;
  recoveryInFlight = true;

  try {
    // 1. Validate / refresh access token once
    try {
      await resolveValidAccessToken();
    } catch (err) {
      if (isRefreshAuthFailure(err)) {
        // Genuine auth failure (401/403/missing token) after network came back — let authToken handle logout
        try {
          await refreshAccessToken();
        } catch {
          // refreshAccessToken itself will throw; the api interceptor will clear session on the next 401
        }
      }
      // For network errors at this point, do nothing — socket will reconnect on its own
    }

    // 2. Reconnect socket with a fresh session handshake to avoid stale sids
    const socket = getSocket();
    if (socket) {
      socket.disconnect();
      const freshToken = localStorage.getItem('accessToken') || '';
      if (freshToken) {
        socket.auth = { token: freshToken };
      }
      socket.connect();
    }
  } finally {
    recoveryInFlight = false;
  }
};

const handleOnline = (): void => {
  offlineToastShown = false;

  // Small delay to let the OS stabilize the new network path before attempting requests
  setTimeout(() => {
    void onNetworkRestored();
  }, ONLINE_RECOVERY_DELAY_MS);
};

const handleOffline = (): void => {
  if (!offlineToastShown) {
    offlineToastShown = true;
    // No toast here — Socket.IO will reconnect automatically and show transient state.
    // We only note it internally so that we don't fire unneeded recovery logic while offline.
  }
};

let installed = false;

/**
 * Install once at app startup (called from App.tsx or main.tsx equivalent).
 * Safe to call multiple times — guards against duplicate registration.
 */
export const installNetworkRecovery = (): (() => void) => {
  if (installed) return () => {};
  installed = true;

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    installed = false;
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
