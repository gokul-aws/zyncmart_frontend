import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

// Attach access token from authStore on every request (client-side only)
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { useAuthStore } = await import('@/lib/store/authStore');
    const token: string | null = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// Refresh the access token using the refresh token cookie
const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const { data } = await axios.post(
    `${BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  return data.data as { accessToken: string; refreshToken: string };
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// On 401, attempt a silent token refresh then replay the original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config as RetryConfig | undefined;

    if (error.response?.status === 401 && config && !config._retry) {
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
          config.headers.set('Authorization', `Bearer ${newToken}`);
        }

        return api(config);
      } catch {
        const { useAuthStore } = await import('@/lib/store/authStore');
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          const redirectTo = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
          window.location.href = redirectTo;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
