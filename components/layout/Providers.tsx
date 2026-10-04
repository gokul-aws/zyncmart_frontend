'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { MotionConfig } from 'framer-motion';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore } from '@/lib/store/cartStore';

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
    useCartStore.getState().loadCart();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* framer-motion skips transform/layout animation when the OS asks for reduced motion. */}
      <MotionConfig reducedMotion="user">
        {children}
        <CartDrawer />
      </MotionConfig>
      {/* Top-centre stays clear of the sticky header actions and the mobile bottom nav. */}
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
