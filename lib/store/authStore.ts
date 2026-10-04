import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/user';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (
    user: User,
    accessToken?: string | null,
    refreshToken?: string | null,
    cookieMaxAge?: number
  ) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: User['role']) => boolean;
}

const DEFAULT_REFRESH_COOKIE_AGE = 604800; // 7 days

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken, refreshToken, cookieMaxAge = DEFAULT_REFRESH_COOKIE_AGE) => {
        const nextAccessToken = accessToken !== undefined ? accessToken : get().accessToken;

        if (typeof window !== 'undefined' && refreshToken) {
          let cookie = `refreshToken=${refreshToken}; path=/; SameSite=Lax`;
          if (cookieMaxAge > 0) {
            cookie += `; max-age=${cookieMaxAge}`;
          }
          if (process.env.NODE_ENV === 'production') {
            cookie += '; Secure';
          }
          document.cookie = cookie;
        }

        set({ user, accessToken: nextAccessToken });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          document.cookie = `refreshToken=; path=/; max-age=0; SameSite=Lax`;
        }
        set({ user: null, accessToken: null });
      },
      isAuthenticated: () => !!get().accessToken,
      isAdmin: () => get().user?.role === 'admin',
      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
