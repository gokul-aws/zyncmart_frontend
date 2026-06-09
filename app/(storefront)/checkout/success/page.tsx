import type { Metadata } from 'next';
import { Suspense } from 'react';
import SuccessClient from '@/components/checkout/SuccessClient';

export const metadata: Metadata = {
  title: 'Order Placed',
  description: 'Your order has been placed successfully.',
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessClient />
    </Suspense>
  );
}
