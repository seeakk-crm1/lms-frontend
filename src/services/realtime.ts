import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';

let socket: Socket | null = null;

const getRealtimeBaseUrl = (): string => {
  const backendUrl = ENV.BACKEND_URL || ENV.API_URL;
  return backendUrl.replace(/\/api\/?$/, '');
};

export const connectRealtime = (accessToken: string): Socket => {
  const baseUrl = getRealtimeBaseUrl();

  if (socket?.connected) {
    const currentToken = String((socket.auth as any)?.token || '');
    if (currentToken === accessToken) return socket;
    socket.disconnect();
  }

  socket = io(baseUrl, {
    // Start with polling to avoid websocket-first handshake drops on some hosted edges.
    transports: ['polling', 'websocket'],
    withCredentials: true,
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  return socket;
};

export const disconnectRealtime = (): void => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
