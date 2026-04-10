import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deviceId', deviceId);
}

// Add a request interceptor to attach the access token and device ID
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.headers) {
            config.headers['x-device-id'] = deviceId as string;
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Lock flags to prevent parallel refreshes firing
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];
let isRedirectingToLogin = false;

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
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
    useAuthStore.getState().clearAuth();
    redirectToLogin();
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!originalRequest || !originalRequest.url) {
            return Promise.reject(error);
        }

        // Skip interceptor if the failed call was the login or refresh call itself
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If it's already busy refreshing, place failed requests inside the queue
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                clearExpiredSession();
                return Promise.reject(error);
            }

            return new Promise(function (resolve, reject) {
                axios
                    .post(`${API_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
                    .then(({ data }) => {
                        useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
                        if (originalRequest.headers) {
                            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
                        }
                        processQueue(null, data.accessToken);
                        resolve(api(originalRequest)); // retry the original request
                    })
                    .catch((err) => {
                        // Refresh token failed -> Force full logout
                        processQueue(err, null);
                        clearExpiredSession();
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false; // Release the lock
                    });
            });
        }

        return Promise.reject(error);
    }
);

export default api;
