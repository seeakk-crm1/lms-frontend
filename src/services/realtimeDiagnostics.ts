/**
 * Debug helpers for Socket.IO / Engine.IO failures (browser reports 'CORS' on non-2xx often).
 */

export type ConnectionFailureKind =
  | 'cors_surface_symptom'
  | 'backend_unreachable'
  | 'dns_or_tls'
  | 'socket_auth_or_handshake'
  | 'unknown';

export const classifySocketErrorMessage = (raw: string): ConnectionFailureKind => {
  const m = raw.toLowerCase();
  if (m.includes('xhr poll') || m.includes('websocket error')) {
    return 'cors_surface_symptom';
  }
  if (m.includes('network') || m.includes('failed to fetch') || m.includes('load failed')) {
    return 'backend_unreachable';
  }
  if (m.includes('getaddrinfo') || m.includes('name not resolved') || m.includes('ssl') || m.includes('certificate')) {
    return 'dns_or_tls';
  }
  if (
    m.includes('unauthorized') ||
    m.includes('invalid namespace') ||
    m.includes('jwt') ||
    m.includes('token') ||
    m.includes('authentication')
  ) {
    return 'socket_auth_or_handshake';
  }
  return 'unknown';
};

export const explainFailureKind = (kind: ConnectionFailureKind, backendOrigin: string): string => {
  const healthUrl = `${backendOrigin.replace(/\/$/, '')}/healthz`;
  switch (kind) {
    case 'cors_surface_symptom':
      return (
        `Often NOT a CORS misconfiguration: the polling request got a non-OK response (404/502) without ACAO headers. ` +
        `Open ${healthUrl} — if it is not JSON {"ok":true,...}, your backend URL is wrong or Render has no running service (see x-render-routing: no-server).`
      );
    case 'backend_unreachable':
      return `Cannot reach ${backendOrigin}. Check VPN, Render sleep/failure, or set VITE_SOCKET_URL / VITE_API_URL in Vercel (redeploy after env change).`;
    case 'dns_or_tls':
      return `DNS or TLS issue for ${backendOrigin}. Verify the hostname matches your Render dashboard URL exactly.`;
    case 'socket_auth_or_handshake':
      return 'HTTP reached Socket.IO but handshake rejected (JWT / middleware). Try refreshing the session or re-login.';
    default:
      return `See Network tab for ${backendOrigin}/socket.io — status line and response body tell the real cause.`;
  }
};
