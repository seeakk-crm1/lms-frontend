import { create } from 'zustand';

// Increment this when user schema changes (e.g. MongoDB → PostgreSQL migration)
// Forces all users to re-login and clears stale localStorage data
const STORE_VERSION = '2';
if (localStorage.getItem('storeVersion') !== STORE_VERSION) {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.setItem('storeVersion', STORE_VERSION);
}

const useAuthStore = create((set) => {
    // Safely parse local storage state
    let initialUser = null;
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
                    ? rawUser.role.name || 'Administrator'
                    : rawUser.role || 'Administrator'
            } : rawUser;

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
            }
            set({ user, accessToken, refreshToken, isAuthenticated: true });
        },

        updateUser: (updatedFields) => set((state) => {
            if (!state.user) return state;
            const newUser = { ...state.user, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(newUser));
            return { user: newUser };
        }),

        logout: async () => {
            // Unconditionally wipe client data for safety
            const currentRefreshToken = localStorage.getItem('refreshToken');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });

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
