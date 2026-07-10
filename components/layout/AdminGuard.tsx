'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeHydrated, setStoreHydrated] = useState(false);

  useEffect(() => {
    // Mark store as hydrated on mount (client-side only)
    setStoreHydrated(true);
  }, []);

  useEffect(() => {
    if (!storeHydrated) return;

    if (!accessToken) {
      // TODO: Admin Sign In is temporarily disabled as a separate UI entry
      // point — route unauthenticated visitors through the unified customer
      // login page instead. The /admin/login route/page remains in the
      // codebase, just not linked to from here.
      // router.replace(`/admin/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user) {
      if (user.role === 'admin') {
        setIsAuthorized(true);
      } else {
        router.replace('/');
      }
      setIsLoading(false);
      return;
    }

    // If we have a token but no user object, force a fresh sign-in.
    // TODO: Admin Sign In is temporarily disabled as a separate UI entry
    // point — see note above. /admin/login route/page remains in the codebase.
    // router.replace(`/admin/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    setIsLoading(false);
  }, [user, accessToken, router, storeHydrated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
        <div className="max-w-md w-full rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Unauthorized</h1>
          <p className="text-sm text-gray-600 mb-6">
            You need an admin account to access this section. Please sign in with an admin credential.
          </p>
          {/*
            TODO: Admin Sign In is temporarily disabled as a separate UI entry
            point — this button now sends users through the unified customer
            login page instead. The /admin/login route/page remains in the
            codebase, just not linked to from here.
            <button
              type="button"
              onClick={() => router.replace('/admin/login')}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Go to Admin Login
            </button>
          */}
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
