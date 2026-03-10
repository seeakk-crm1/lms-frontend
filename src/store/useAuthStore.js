import { create } from 'zustand';

const useAuthStore = create((set) => {
    // Safely parse local storage state
    let initialUser = null;
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) initialUser = JSON.parse(storedUser);
    } catch {
        initialUser = null;
    }

    return {
        user: initialUser,
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        isAuthenticated: !!localStorage.getItem('accessToken'),

        setAuth: (user, accessToken, refreshToken) => {
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
