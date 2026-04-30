import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';
import useAuthStore from '../store/useAuthStore';

let socket: Socket | null = null;

const getRealtimeBaseUrl = (): string => {
  const backendUrl = ENV.BACKEND_URL || ENV.API_URL;
  return backendUrl.replace(/\/api\/?$/, '');
};

export const connectRealtime = (accessToken: string): Socket => {
  const baseUrl = getRealtimeBaseUrl();

  if (socket) {
    const currentToken = String((socket.auth as any)?.token || '');
    if (currentToken === accessToken && (socket.connected || (socket as any).active)) return socket;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(baseUrl, {
    transports: ['websocket'],
    withCredentials: true,
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('[Socket.io] Connected successfully');
  });

  socket.on('connect_error', (err: any) => {
    const message = String(err?.message || '').toLowerCase();
    console.warn('[Socket.io] Connection error:', err?.message || String(err));
    if (
      message.includes('unauthorized') ||
      message.includes('token') ||
      message.includes('authentication') ||
      message.includes('jwt')
    ) {
      console.warn('[Socket.io] Auth failed - clearing session');
      useAuthStore.getState().clearAuth();
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
    if (reason === 'io server disconnect') {
      console.warn('[Socket.io] Server forced disconnect');
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('[Socket.io] Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (err: any) => {
    console.warn('[Socket.io] Reconnect error:', err?.message || String(err));
  });

  socket.on('reconnect_failed', () => {
    console.error('[Socket.io] All reconnect attempts failed');
  });

  return socket;
};

export const disconnectRealtime = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
