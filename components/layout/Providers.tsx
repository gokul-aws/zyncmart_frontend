'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
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
      {children}
      <CartDrawer />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
