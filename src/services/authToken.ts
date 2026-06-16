import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import type { User } from '../types/user.types';
import { ENV } from '../config/env';

const API_URL = ENV.API_URL;

/** Single-flight refresh so Socket + many axios callers share one rotation. */
let refreshPromise: Promise<string> | null = null;

const MAX_REFRESH_ATTEMPTS = 2;
const REFRESH_RETRY_DELAY_MS = 350;

type TokenRefreshListener = (accessToken: string) => void;
const tokenRefreshListeners = new Set<TokenRefreshListener>();

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Thrown when the session cannot be renewed (missing/invalid refresh token). */
export class AuthSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthSessionError';
  }
}

export const getAccessTokenExpMs = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

/**
 * True when the access JWT is missing, malformed, or expires within `skewMs`.
 * Default skew refreshes ~2 minutes early to avoid races with sockets and parallel requests.
 */
export const isAccessTokenExpired = (token: string, skewMs = 120_000): boolean => {
  const exp = getAccessTokenExpMs(token);
  if (exp === null) return true;
  return exp < Date.now() + skewMs;
};

/** Definitive auth failures — only these should clear the session. */
export const isRefreshAuthFailure = (error: unknown): boolean => {
  if (error instanceof AuthSessionError) return true;
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 400 || status === 401 || status === 403;
};

/** Transient failures (Redis/DB blip, network) — retry refresh, do not logout. */
export const isTransientRefreshFailure = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  if (!status) return true;
  return status === 502 || status === 503 || status === 504;
};

export const onAccessTokenRefreshed = (listener: TokenRefreshListener): (() => void) => {
  tokenRefreshListeners.add(listener);
  return () => {
    tokenRefreshListeners.delete(listener);
  };
};

const notifyAccessTokenRefreshed = (accessToken: string): void => {
  tokenRefreshListeners.forEach((listener) => {
    try {
      listener(accessToken);
    } catch {
      // Listener errors must not break refresh flow
    }
  });
};

/**
 * Returns a valid access token, refreshing when needed.
 * Never returns an expired token when a refresh token is available.
 */
export const resolveValidAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return accessToken;
  }

  if (!refreshToken) {
    throw new AuthSessionError('No refresh token available');
  }

  return refreshAccessToken();
};

/**
 * Handles 401 from API calls: refresh once, retry the request config, logout only on auth failure.
 */
export const handleUnauthorizedRequest = async <T>(
  retry: () => Promise<T>,
): Promise<T> => {
  const accessToken = await refreshAccessToken();
  notifyAccessTokenRefreshed(accessToken);
  return retry();
};

/**
 * Rotates refresh → access via `/auth/refresh`, updates zustand + localStorage.
 * Concurrent callers await the same in-flight promise (no duplicate rotations).
 */
export const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new AuthSessionError('No refresh token available');
  }

  refreshPromise = (async () => {
    let lastError: unknown;

    try {
      for (let attempt = 0; attempt < MAX_REFRESH_ATTEMPTS; attempt += 1) {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (!currentRefreshToken) {
          throw new AuthSessionError('No refresh token available');
        }

        try {
          const { data } = await axios.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>(
            `${API_URL}/auth/refresh`,
            { refreshToken: currentRefreshToken },
            { withCredentials: true },
          );

          useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
          notifyAccessTokenRefreshed(data.accessToken);
          return data.accessToken;
        } catch (error) {
          lastError = error;
          const canRetry =
            isTransientRefreshFailure(error) && attempt < MAX_REFRESH_ATTEMPTS - 1;
          if (!canRetry) {
            throw error;
          }
          await sleep(REFRESH_RETRY_DELAY_MS * (attempt + 1));
        }
      }

      throw lastError ?? new AuthSessionError('Refresh token request failed');
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
