import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';
import { SOCKET_IO_CLIENT_PATH } from '../config/socketConstants';
import useAuthStore from '../store/useAuthStore';
import {
  classifySocketErrorMessage,
  explainFailureKind,
} from './realtimeDiagnostics';
import {
  isRefreshAuthFailure,
  isAccessTokenExpired,
  refreshAccessToken,
} from './authToken';

let socket: Socket | null = null;
let lastSocketUserId: string | null = null;
let authRecoveryInFlight = false;
/** Prevents infinite connect_error → refresh → connect loops on persistent auth failure */
let consecutiveSocketAuthRecoveries = 0;
const MAX_SOCKET_AUTH_RECOVERIES = 5;

const readStoredUserId = (): string | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string };
    return typeof parsed.id === 'string' ? parsed.id : null;
  } catch {
    return null;
  }
};

/** Socket.IO uses HTTP origin only (see ENV.SOCKET_URL); never use VITE_API_URL directly if it ends with /api */
const getRealtimeBaseUrl = (): string => ENV.SOCKET_URL;

const maxAttempts = Number.parseInt(
  import.meta.env.VITE_SOCKET_MAX_RECONNECT_ATTEMPTS || '25',
  10,
);
const safeMaxAttempts = Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 25;

/** Long-polling only — use on Render/proxies if WebSocket upgrades still fail after other fixes. */
const socketPollingOnly = (): boolean => {
  const v = String(import.meta.env.VITE_SOCKET_TRANSPORTS || '')
    .trim()
    .toLowerCase();
  return v === 'polling' || v === 'poll' || v === 'long-polling';
};

/**
 * Render / many reverse proxies handle Engine.IO long-polling reliably but intermittently drop
 * the WebSocket upgrade. `rememberUpgrade: true` skips polling on later connects and retries WS
 * first — that surfaces as "WebSocket connection ... failed" in DevTools while the app looks broken.
 */
const socketRememberUpgrade = (): boolean => {
  if (import.meta.env.PROD) return false;
  const v = String(import.meta.env.VITE_SOCKET_REMEMBER_UPGRADE || '')
    .trim()
    .toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return true;
};

const isLikelySocketAuthError = (msg: string): boolean => {
  const lower = msg.toLowerCase();
  return (
    lower.includes('unauthorized') ||
    lower.includes('token') ||
    lower.includes('authentication') ||
    lower.includes('jwt')
  );
};

const attachCoreSocketHandlers = (s: Socket, baseUrl: string): void => {
  s.on('connect', () => {
    consecutiveSocketAuthRecoveries = 0;
    console.info('[Socket.io] Connected', { origin: baseUrl });
  });

  s.on('connect_error', async (err: Error & { message?: string }) => {
    const msg = err?.message || String(err);
    const kind = classifySocketErrorMessage(msg);
    console.warn('[Socket.io] connect_error:', msg);
    console.warn('[Socket.io]', explainFailureKind(kind, baseUrl));

    if (!isLikelySocketAuthError(msg)) return;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('[Socket.io] Auth handshake failed and no refresh token — clearing session');
      useAuthStore.getState().clearAuth();
      return;
    }

    if (authRecoveryInFlight) return;

    if (consecutiveSocketAuthRecoveries >= MAX_SOCKET_AUTH_RECOVERIES) {
      console.warn('[Socket.io] Too many auth recovery attempts — clearing session');
      useAuthStore.getState().clearAuth();
      return;
    }
    consecutiveSocketAuthRecoveries += 1;

    authRecoveryInFlight = true;
    try {
      await refreshAccessToken();
      s.connect();
    } catch (e) {
      if (isRefreshAuthFailure(e)) {
        console.warn('[Socket.io] Refresh failed after auth error — clearing session');
        useAuthStore.getState().clearAuth();
      } else {
        console.warn(
          '[Socket.io] Auth error but refresh failed transiently; leaving session intact for retry',
        );
      }
    } finally {
      authRecoveryInFlight = false;
    }
  });

  s.on('disconnect', (reason) => {
    console.info('[Socket.io] disconnect:', reason);
    if (reason === 'io server disconnect') {
      console.warn('[Socket.io] Server closed the connection');
    }
  });

  s.on('reconnect', (attemptNumber) => {
    console.info('[Socket.io] Reconnected after attempts:', attemptNumber);
  });

  s.on('reconnect_error', (err: Error) => {
    console.warn('[Socket.io] reconnect_error:', err?.message || String(err));
  });

  s.on('reconnect_failed', () => {
    console.error(
      `[Socket.io] Reconnect exhausted (${safeMaxAttempts} attempts). Verify ${baseUrl}/healthz returns JSON and Vercel has VITE_SOCKET_URL or VITE_API_URL (socket origin is derived from API URL).`,
    );
  });
};

/**
 * Ensures a single Socket.IO client for the logged-in user.
 * Auth payload is resolved on every Engine.IO open so reconnects use a fresh access JWT.
 */
export const connectRealtime = (): Socket | null => {
  const baseUrl = getRealtimeBaseUrl();
  const userId = readStoredUserId();
  const hasAccess = Boolean(localStorage.getItem('accessToken'));

  if (!userId || !hasAccess) {
    disconnectRealtime();
    return null;
  }

  if (socket && lastSocketUserId === userId) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  lastSocketUserId = userId;

  const pollingOnly = socketPollingOnly();
  socket = io(baseUrl, {
    path: SOCKET_IO_CLIENT_PATH,
    transports: pollingOnly ? ['polling'] : ['polling', 'websocket'],
    upgrade: !pollingOnly,
    withCredentials: true,
    rememberUpgrade: socketRememberUpgrade(),
    auth: (cb) => {
      void (async () => {
        try {
          let token = localStorage.getItem('accessToken') || '';
          const rt = localStorage.getItem('refreshToken');
          if (token && rt && isAccessTokenExpired(token)) {
            token = await refreshAccessToken();
          }
          cb({ token });
        } catch {
          cb({ token: localStorage.getItem('accessToken') || '' });
        }
      })();
    },
    reconnection: true,
    reconnectionAttempts: safeMaxAttempts,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    randomizationFactor: 0.5,
    timeout: 30000,
    autoConnect: true,
  });

  attachCoreSocketHandlers(socket, baseUrl);

  return socket;
};

export const disconnectRealtime = (): void => {
  lastSocketUserId = null;
  authRecoveryInFlight = false;
  consecutiveSocketAuthRecoveries = 0;
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
