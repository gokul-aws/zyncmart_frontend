'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { login, register, verifyRegistrationOtp, resendRegistrationOtp, logout } from '@/lib/api/auth';
import { mergeCart } from '@/lib/api/cart';
import type { LoginPayload, RegisterPayload } from '@/lib/api/auth';

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
      error?: string;
      details?: Array<{
        field?: string;
        message?: string;
        msg?: string;
      } | string>;
    };
  };
}

// Helper to safely extract error messages
function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const errorLike = err as AxiosErrorLike;
    const response = errorLike.response;
    
    // 1. Check if there are validation/error details
    if (response?.data?.details && Array.isArray(response.data.details) && response.data.details.length > 0) {
      return response.data.details
        .map((detail) => {
          if (typeof detail === 'string') return detail;
          return detail?.message || detail?.msg || '';
        })
        .filter(Boolean)
        .join('\n');
    }
    
    // 2. Check for response.data.message
    if (response?.data?.message) {
      return response.data.message;
    }

    // 3. Check for response.data.error
    if (response?.data?.error) {
      return response.data.error;
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

  // Shared tail of any successful auth (login or OTP-verified registration):
  // merge the guest cart into the account's, then hard-navigate so every
  // store/provider re-hydrates from the freshly-set auth state.
  const finishAuth = async (destination: string) => {
    if (items.length > 0) {
      try {
        await mergeCart(items);
      } catch (cartErr) {
        console.error('Cart merge failed, continuing...', cartErr);
      }
    }
    router.refresh();
    window.location.href = destination;
  };

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

      // Unified login: role decides where the user lands after sign-in.
      // Admins go to the admin dashboard (unless already headed to a specific
      // /admin/* page); everyone else goes home unless an explicit non-admin
      // redirect (e.g. back to /account or /checkout) was requested.
      const requestedAdminPath = redirectTo.startsWith('/admin');
      const isAdminUser = newUser.role === 'admin';
      const destination = isAdminUser
        ? requestedAdminPath
          ? redirectTo
          : '/admin/dashboard'
        : requestedAdminPath
          ? '/'
          : redirectTo;

      await finishAuth(destination);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of registration: send an OTP to the email. No account exists yet
  // — returns the email on success (for the UI to move to the OTP step) or
  // null on failure (see `error`).
  const signUp = async (payload: RegisterPayload): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const { email } = await register(payload);
      return email;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Step 2 of registration: verify the OTP, which creates the account and
  // logs the user in — same completion flow as signIn.
  const verifyOtp = async (email: string, otp: string, redirectTo = '/account') => {
    setLoading(true);
    setError(null);
    try {
      const { user: newUser, accessToken, refreshToken } = await verifyRegistrationOtp(email, otp);
      setAuth(newUser, accessToken, refreshToken);
      await finishAuth(redirectTo);
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Invalid or expired OTP. Please try again.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    setError(null);
    try {
      await resendRegistrationOtp(email);
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to resend OTP. Please try again.'));
      return false;
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
    verifyOtp,
    resendOtp,
    signOut,
    loading,
    error
  };
}