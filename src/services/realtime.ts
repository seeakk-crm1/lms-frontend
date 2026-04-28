import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getRealtimeBaseUrl = (): string => {
  const backendUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    'https://backend-26l2.onrender.com';
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
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: {
      token: accessToken,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
};

export const disconnectRealtime = (): void => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
