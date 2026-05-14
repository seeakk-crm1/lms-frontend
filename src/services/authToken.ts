import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import type { User } from '../types/user.types';
import { ENV } from '../config/env';

const API_URL = ENV.API_URL;

/** Single-flight refresh so Socket + many axios callers share one rotation. */
let refreshPromise: Promise<string> | null = null;

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

export const isRefreshAuthFailure = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 400 || status === 401 || status === 403;
};

/**
 * Rotates refresh → access via `/auth/refresh`, updates zustand + localStorage.
 * Concurrent callers await the same in-flight promise (no duplicate rotations).
 */
export const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>(`${API_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
      useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
