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
let recoveryTimer: ReturnType<typeof setTimeout> | null = null;

const ONLINE_RECOVERY_DELAY_MS = 600; // brief stabilization window after "online" or visibility fires

/**
 * Attempt to restore auth + socket state after network is back or tab becomes visible.
 * Called at most once per network restoration event.
 */
const onNetworkRestored = async (): Promise<void> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  if (recoveryInFlight) return;
  recoveryInFlight = true;

  try {
    // 1. Validate / refresh access token once if needed
    try {
      await resolveValidAccessToken();
    } catch (err) {
      if (isRefreshAuthFailure(err)) {
        try {
          await refreshAccessToken();
        } catch {
          // let interceptor handle session expiry
        }
      }
    }

    // 2. Reconnect socket if disconnected, ensuring fresh auth token
    const socket = getSocket();
    if (socket && !socket.connected) {
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

const triggerDebouncedRecovery = (): void => {
  if (recoveryTimer) {
    clearTimeout(recoveryTimer);
  }

  recoveryTimer = setTimeout(() => {
    recoveryTimer = null;
    void onNetworkRestored();
  }, ONLINE_RECOVERY_DELAY_MS);
};

const handleOnline = (): void => {
  triggerDebouncedRecovery();
};

const handleOffline = (): void => {
  if (recoveryTimer) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }
};

const handleVisibilityChange = (): void => {
  if (document.visibilityState === 'visible' && typeof navigator !== 'undefined' && navigator.onLine) {
    triggerDebouncedRecovery();
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
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    installed = false;
    if (recoveryTimer) {
      clearTimeout(recoveryTimer);
      recoveryTimer = null;
    }
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
