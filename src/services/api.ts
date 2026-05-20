import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/useAuthStore';
import { ENV } from '../config/env';
import {
  isAccessTokenExpired,
  isRefreshAuthFailure,
  refreshAccessToken,
} from './authToken';
import { MANDATORY_FOLLOWUP_QUERY_KEY } from '../constants/mandatoryFollowup.constants';
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
  useAuthStore.getState().clearAuth();
  redirectToLogin();
};

// Add a request interceptor to attach tokens AND proactively refresh
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.headers) return config;

    config.headers['x-device-id'] = deviceId as string;

    // Skip proactive refresh for auth endpoints
    if (
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/google') ||
      config.url?.includes('/auth/refresh')
    ) {
      return config;
    }

    let accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken && isAccessTokenExpired(accessToken)) {
      try {
        accessToken = await refreshAccessToken();
      } catch {
        accessToken = localStorage.getItem('accessToken');
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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

    if (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/google') ||
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 423) {
      const payload = error.response.data as {
        mandatoryFollowupRequired?: boolean;
        mandatoryFollowupCount?: number;
      };
      useAuthStore.getState().setMandatoryFollowupBlock(
        true,
        payload?.mandatoryFollowupCount ?? 0,
      );
      void queryClient.invalidateQueries({ queryKey: MANDATORY_FOLLOWUP_QUERY_KEY });
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        if (!isRefreshAuthFailure(err)) {
          return Promise.reject(error);
        }
        clearExpiredSession();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
