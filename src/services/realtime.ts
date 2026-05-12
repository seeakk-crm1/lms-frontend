import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';
import useAuthStore from '../store/useAuthStore';
import {
  classifySocketErrorMessage,
  explainFailureKind,
} from './realtimeDiagnostics';

let socket: Socket | null = null;

/** Socket.IO connects to HTTP origin only — never append /api */
const getRealtimeBaseUrl = (): string => ENV.BACKEND_URL;

const maxAttempts = Number.parseInt(import.meta.env.VITE_SOCKET_MAX_RECONNECT_ATTEMPTS || '25', 10);
const safeMaxAttempts = Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 25;

export const connectRealtime = (accessToken: string): Socket => {
  const baseUrl = getRealtimeBaseUrl();

  if (socket) {
    const currentToken = String((socket.auth as { token?: string })?.token || '');
    if (currentToken === accessToken && socket.connected) return socket;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(baseUrl, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    withCredentials: true,
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionAttempts: safeMaxAttempts,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    randomizationFactor: 0.5,
    timeout: 20000,
    forceNew: true,
  });

  socket.on('connect', () => {
    console.info('[Socket.io] Connected', { origin: baseUrl });
  });

  socket.on('connect_error', (err: Error & { message?: string }) => {
    const msg = err?.message || String(err);
    const kind = classifySocketErrorMessage(msg);
    console.warn('[Socket.io] connect_error:', msg);
    console.warn('[Socket.io]', explainFailureKind(kind, baseUrl));

    const lower = msg.toLowerCase();
    if (
      lower.includes('unauthorized') ||
      lower.includes('token') ||
      lower.includes('authentication') ||
      lower.includes('jwt')
    ) {
      console.warn('[Socket.io] Treating as auth failure — clearing session');
      useAuthStore.getState().clearAuth();
    }
  });

  socket.on('disconnect', (reason) => {
    console.info('[Socket.io] disconnect:', reason);
    if (reason === 'io server disconnect') {
      console.warn('[Socket.io] Server closed the connection');
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.info('[Socket.io] Reconnected after attempts:', attemptNumber);
  });

  socket.on('reconnect_error', (err: Error) => {
    console.warn('[Socket.io] reconnect_error:', err?.message || String(err));
  });

  socket.on('reconnect_failed', () => {
    console.error(
      `[Socket.io] Reconnect exhausted (${safeMaxAttempts} attempts). Check ${baseUrl}/healthz and Vercel env VITE_API_URL / VITE_BACKEND_URL.`,
    );
  });

  return socket;
};

export const disconnectRealtime = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
