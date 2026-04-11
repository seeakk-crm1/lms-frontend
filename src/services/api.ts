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

// Lock flags to prevent parallel refreshes
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

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Consider token expired if it expires within the next 15 seconds
        return (payload.exp * 1000) < (Date.now() + 15000);
    } catch {
        return true;
    }
};

const executeRefresh = async (): Promise<string> => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        clearExpiredSession();
        throw new Error('No refresh token available');
    }

    isRefreshing = true;
    try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);
        return data.accessToken;
    } catch (err) {
        processQueue(err, null);
        clearExpiredSession();
        throw err;
    } finally {
        isRefreshing = false;
    }
};

// Add a request interceptor to attach tokens AND proactively refresh
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (!config.headers) return config;
        
        config.headers['x-device-id'] = deviceId as string;
        
        // Skip proactive refresh for auth endpoints
        if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
            return config;
        }

        let accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // PROACTIVE REFRESH: If token is expired prior to request, refresh it now!
        // This explicitly prevents the backend from ever returning a 401.
        if (accessToken && refreshToken && isTokenExpired(accessToken)) {
            try {
                accessToken = await executeRefresh();
            } catch (err) {
                // If refresh fails, let the request proceed without token
                // It will fail, but the session is already cleared and redirecting
                accessToken = null;
            }
        }

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor for fallback coverage
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!originalRequest || !originalRequest.url) {
            return Promise.reject(error);
        }

        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        // FALLBACK: If somehow the backend still returns 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newAccessToken = await executeRefresh();
                if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                }
                return api(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
