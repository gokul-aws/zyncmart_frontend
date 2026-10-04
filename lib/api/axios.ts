import axios, { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Stable guest ID stored in localStorage so the server can track a guest's cart
const GUEST_ID_KEY = 'guest-id';
function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

// Attach access token / guest-id on every request (client-side only)
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    // Always set guest-id as a default (used for guest cart tracking)
    config.headers.set('x-guest-id', getOrCreateGuestId());

    // Override with auth token if available
    const { useAuthStore } = await import('@/lib/store/authStore');
    const token: string | null = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// Reads a cookie value by name (client-side only)
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// Refresh the access token using the refresh token cookie
const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const refreshToken = getCookie('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const { data } = await axios.post(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { withCredentials: true }
  );
  return data.data as { accessToken: string; refreshToken: string };
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Endpoints where a 401 is a normal business response (bad credentials, expired reset
// token, etc.) — not a sign that the access token needs refreshing. Retrying these via
// the refresh flow would mask the real error and force an unwanted redirect/reload.
const AUTH_ENDPOINTS_EXCLUDED_FROM_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// On 401, attempt a silent token refresh then replay the original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config as RetryConfig | undefined;
    const isExcludedAuthCall = AUTH_ENDPOINTS_EXCLUDED_FROM_REFRESH.some((path) =>
      config?.url?.includes(path)
    );

    if (error.response?.status === 401 && config && !config._retry && !isExcludedAuthCall) {
      config._retry = true;
      try {
        const { accessToken: newToken, refreshToken: newRefreshToken } = await refreshAccessToken();
        const { useAuthStore } = await import('@/lib/store/authStore');
        const store = useAuthStore.getState();

        if (store.user) {
          store.setAuth(store.user, newToken, newRefreshToken);
        } else {
          const { fetchMe } = await import('@/lib/api/auth');
          const user = await fetchMe();
          store.setAuth(user, newToken, newRefreshToken);
        }

        if (config.headers) {
          if (!config.headers) {
            config.headers = new AxiosHeaders();
          }
          config.headers.set('Authorization', `Bearer ${newToken}`);
        }

        return api(config);
      } catch {
        const { useAuthStore } = await import('@/lib/store/authStore');
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          // TODO: Admin Sign In is temporarily disabled as a separate UI entry
          // point — always bounce through the unified customer login page,
          // preserving the current path so the user returns here post-login.
          // const redirectTo = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
          const redirectTo = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          window.location.href = redirectTo;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
