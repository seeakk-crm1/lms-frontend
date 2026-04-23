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
const STORE_VERSION = '4';
if (localStorage.getItem('storeVersion') !== STORE_VERSION) {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.setItem('storeVersion', STORE_VERSION);
}

const normalizeUserRole = (role: unknown): User['role'] => {
    if (typeof role === 'object' && role !== null) {
        const normalizedRole = role as { id?: string; name?: string; status?: string; isSystemRole?: boolean };
        return {
            id: normalizedRole.id,
            name: normalizedRole.name || 'Administrator',
            status: normalizedRole.status,
            isSystemRole: normalizedRole.isSystemRole,
        };
    }

    if (typeof role === 'string' && role.trim().length > 0) {
        return role;
    }

    return 'Administrator';
};

const normalizePermissions = (permissions: unknown): string[] => {
    if (!Array.isArray(permissions)) return [];
    return permissions.map((permission) => String(permission));
};

const normalizeStoredUser = (rawUser: User | null): User | null => {
    if (!rawUser) return rawUser;

    return {
        ...rawUser,
        role: normalizeUserRole(rawUser.role),
        permissions: normalizePermissions(rawUser.permissions || []),
    };
};

const useAuthStore = create<AuthState>((set) => {
    // Safely parse local storage state
    let initialUser: User | null = null;
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            initialUser = normalizeStoredUser(parsed);
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
            const user = normalizeStoredUser(rawUser);

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
            const newUser = normalizeStoredUser({ ...state.user, ...updatedFields });
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
