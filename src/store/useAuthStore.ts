import { create } from 'zustand';
import { User } from '../types/user.types';
import { queryClient } from '../lib/queryClient';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, accessToken: string | null, refreshToken: string | null) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

// Increment this when user schema changes (e.g. MongoDB → PostgreSQL migration)
// Forces all users to re-login and clears stale localStorage data
const STORE_VERSION = '2';
if (localStorage.getItem('storeVersion') !== STORE_VERSION) {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.setItem('storeVersion', STORE_VERSION);
}

const useAuthStore = create<AuthState>((set) => {
    // Safely parse local storage state
    let initialUser: User | null = null;
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            // Normalize role: if it's an object, extract the name string
            // This handles stale MongoDB data that stored the full role object
            if (parsed && typeof parsed.role === 'object' && parsed.role !== null) {
                parsed.role = parsed.role.name || 'Administrator';
            }
            initialUser = parsed;
        }
    } catch {
        initialUser = null;
        localStorage.removeItem('user');
    }

    const clearAuthState = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('jobId');
        queryClient.clear();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    };

    return {
        user: initialUser,
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        isAuthenticated: !!localStorage.getItem('accessToken'),

        setAuth: (rawUser, accessToken, refreshToken) => {
            // Normalize role: always store it as a plain string to avoid React rendering crashes
            const user = rawUser ? {
                ...rawUser,
                role: typeof rawUser.role === 'object' && rawUser.role !== null
                    ? (rawUser.role as any).name || 'Administrator'
                    : (rawUser.role as string) || 'Administrator'
            } : rawUser;

            set((state) => {
                const previousUserId = state.user?.id || null;
                const nextUserId = user?.id || null;
                const isUserSwitch = previousUserId !== null && nextUserId !== null && previousUserId !== nextUserId;

                if (isUserSwitch) {
                    queryClient.clear();
                    localStorage.removeItem('jobId');
                }

                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                    if (refreshToken) {
                        localStorage.setItem('refreshToken', refreshToken);
                    } else {
                        localStorage.removeItem('refreshToken');
                    }
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }

                return { user, accessToken, refreshToken, isAuthenticated: !!accessToken };
            });
        },

        updateUser: (updatedFields) => set((state) => {
            if (!state.user) return state;
            const newUser = { ...state.user, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(newUser));
            return { user: newUser };
        }),

        clearAuth: () => {
            clearAuthState();
        },

        logout: async () => {
            const currentRefreshToken = localStorage.getItem('refreshToken');
            clearAuthState();

            // Fire and forget logout to clear session at Redis DB
            if (currentRefreshToken) {
                try {
                    const apiModule = await import('../services/api');
                    await apiModule.default.post('/auth/logout', { refreshToken: currentRefreshToken });
                } catch (error) {
                    // Ignore backend failures on logout
                    console.error("Logout request failed:", error);
                }
            }
        },
    };
});

export default useAuthStore;
