import { create } from 'zustand';
import { User } from '../types/user';
import { authService } from '../services/api/authService';
import { clearAuthTokens, getAccessToken, saveAccessToken, saveRefreshToken } from '../services/auth/tokenStorage';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      await saveAccessToken(response.accessToken);
      if (response.refreshToken) {
        await saveRefreshToken(response.refreshToken);
      }
      set({ isAuthenticated: true, user: response.user });
    } catch (err) {
      console.error('login error', err);
      throw err;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const usernameFromEmail = email.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || `user${Date.now()}`;
      const response = await authService.register({
        fullName: name,
        username: `${usernameFromEmail}${Math.floor(Math.random() * 1000)}`,
        email,
        password,
      });
      await saveAccessToken(response.accessToken);
      if (response.refreshToken) {
        await saveRefreshToken(response.refreshToken);
      }
      set({ isAuthenticated: true, user: response.user });
    } catch (err) {
      console.error('register error', err);
      throw err;
    }
  },

  logout: async () => {
    await clearAuthTokens();
    set({ isAuthenticated: false, user: null });
  },
  setUser: (user: User) => set({ user }),

  restoreSession: async () => {
    const token = await getAccessToken();
    if (token) {
      try {
        const user = await authService.getProfile();
        set({ isAuthenticated: true, user, isLoading: false });
      } catch (e) {
        await clearAuthTokens();
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } else {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));
