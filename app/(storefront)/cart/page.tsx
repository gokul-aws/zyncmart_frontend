import type { Metadata } from 'next';
import Link from 'next/link';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your cart and proceed to checkout.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
