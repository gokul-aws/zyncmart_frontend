'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { login, register, logout } from '@/lib/api/auth';
import { mergeCart } from '@/lib/api/cart';
import type { LoginPayload, RegisterPayload } from '@/lib/api/auth';

// Helper to safely extract error messages
function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as any).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return err instanceof Error ? err.message : defaultMsg;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const { items, clearCart } = useCartStore();

  const signIn = async (
    payload: LoginPayload,
    redirectTo = '/account',
    rememberMe = false
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { user: newUser, accessToken, refreshToken } = await login(payload);

      setAuth(
        newUser,
        accessToken,
        refreshToken,
        rememberMe ? undefined : 0
      );

      const destination =
        redirectTo.startsWith('/admin') && newUser.role !== 'admin'
          ? '/account'
          : redirectTo;

      if (items.length > 0) {
        try {
          await mergeCart(items);
        } catch (cartErr) {
          console.error('Cart merge failed, continuing login...', cartErr);
        }
      }

      router.refresh();
      window.location.href = destination;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (payload: RegisterPayload, redirectTo = '/account') => {
    setLoading(true);
    setError(null);
    try {
      const { user: newUser, accessToken, refreshToken } = await register(payload);
      setAuth(newUser, accessToken, refreshToken);
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout request failed, clearing local state anyway...", err);
    }
    clearAuth();
    clearCart();
    router.push('/');
  };

  // ✅ Good practice: Ensure isAuthenticated evaluates dynamically if it's a function
  return {
    user,
    isAuthenticated: typeof isAuthenticated === 'function' ? isAuthenticated() : isAuthenticated,
    signIn,
    signUp,
    signOut,
    loading,
    error
  };
}