'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchMe } from '@/lib/api/auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    // Fire-and-forget: loadCart() rethrows on failure for callers that need
    // to restore previous state (see cartStore.ts), but this boot-time call
    // has nothing to restore — an uncaught rejection here would just be
    // noise (e.g. a stale/expired persisted token 401ing on this request).
    useCartStore.getState().loadCart().catch(() => {});

    // Validate the persisted session against the backend on boot (the
    // /auth/me equivalent) instead of trusting a possibly-stale localStorage
    // snapshot: this catches a revoked/deactivated account or a role change
    // and refreshes the cached user record. A failure here is handled by the
    // axios interceptor's own silent-refresh/clearAuth flow — nothing else
    // to do on this end.
    const { accessToken, setAuth } = useAuthStore.getState();
    if (accessToken) {
      fetchMe()
        .then((freshUser) => setAuth(freshUser))
        .catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CartDrawer />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
