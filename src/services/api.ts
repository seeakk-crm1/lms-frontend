import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/useAuthStore';
import { ENV } from '../config/env';
import {
  isRefreshAuthFailure,
  resolveValidAccessToken,
  refreshAccessToken,
} from './authToken';
import { ensureBackendReachable } from './backendWarmup';
import { MANDATORY_FOLLOWUP_QUERY_KEY } from '../constants/mandatoryFollowup.constants';
import { OVERDUE_MANDATORY_QUERY_KEY } from '../hooks/useOverdueMandatoryFollowUps';
import { queryClient } from '../lib/queryClient';

const API_URL = ENV.API_URL;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate or retrieve persistent device ID
let deviceId = localStorage.getItem('deviceId');
if (!deviceId) {
  deviceId =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('deviceId', deviceId);
}

let isRedirectingToLogin = false;

export const handleSessionExpired = (): void => {
  useAuthStore.getState().clearAuth();
  redirectToLogin();
};

const redirectToLogin = () => {
  if (typeof window === 'undefined' || isRedirectingToLogin) return;
  isRedirectingToLogin = true;

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const alreadyOnLogin = window.location.pathname === '/login';

  if (alreadyOnLogin) {
    isRedirectingToLogin = false;
    return;
  }

  const next = encodeURIComponent(currentPath);
  window.location.replace(`/login?next=${next}&reason=session-expired`);
};

const clearExpiredSession = () => {
  handleSessionExpired();
};

let backendReadyChain: Promise<boolean> = Promise.resolve(true);

const isAuthRoute = (url?: string): boolean =>
  Boolean(
    url?.includes('/auth/login') ||
      url?.includes('/auth/google') ||
      url?.includes('/auth/refresh') ||
      url?.includes('/auth/forgot-password') ||
      url?.includes('/auth/reset-password'),
  );

const setAuthorizationHeader = (
  config: InternalAxiosRequestConfig,
  accessToken: string,
): void => {
  if (!config.headers) return;
  if (typeof (config.headers as { set?: unknown }).set === 'function') {
    (config.headers as { set: (key: string, value: string) => void }).set(
      'Authorization',
      `Bearer ${accessToken}`,
    );
    return;
  }
  config.headers.Authorization = `Bearer ${accessToken}`;
};

// Add a request interceptor to attach tokens AND proactively refresh
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.headers) return config;

    config.headers['x-device-id'] = deviceId as string;

    if (!isAuthRoute(config.url)) {
      // Fire health check in the background, but do not wait for it to prevent blocking the dashboard
      backendReadyChain = backendReadyChain.then(() => ensureBackendReachable());
    }

    if (isAuthRoute(config.url)) {
      return config;
    }

    try {
      const accessToken = await resolveValidAccessToken();
      if (accessToken) {
        setAuthorizationHeader(config, accessToken);
      }
    } catch (err) {
      if (isRefreshAuthFailure(err)) {
        clearExpiredSession();
      }
      return Promise.reject(err);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor for fallback coverage
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest || !originalRequest.url) {
      return Promise.reject(error);
    }

    if (isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (!error.response && error.message === 'Network Error') {
      import('react-hot-toast').then(({ toast }) => {
        toast.error('Connection Error: Cannot reach the server. Please check your connection or CORS settings.', { id: 'cors-error' });
      });
      // Prevent further retries by standardizing the error for react-query if possible
      error.isAxiosError = false; // Hack to prevent axios-specific retry logic in some libs
      return Promise.reject(error);
    }

    if (error.response?.status === 423) {
      const payload = error.response.data as {
        errorCode?: string;
        mandatoryFollowupRequired?: boolean;
        mandatoryFollowupCount?: number;
        overdueFollowupCount?: number;
      };
      const lockCount =
        payload?.overdueFollowupCount ??
        payload?.mandatoryFollowupCount ??
        0;
      if (payload?.errorCode === 'MANDATORY_FOLLOWUP_REQUIRED') {
        useAuthStore.getState().setMandatoryFollowupBlock(true, lockCount);
        void queryClient.invalidateQueries({ queryKey: MANDATORY_FOLLOWUP_QUERY_KEY });
      }
      void queryClient.invalidateQueries({ queryKey: OVERDUE_MANDATORY_QUERY_KEY });
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        setAuthorizationHeader(originalRequest, newAccessToken);
        return api(originalRequest);
      } catch (err) {
        if (isRefreshAuthFailure(err)) {
          clearExpiredSession();
          return Promise.reject(err);
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
