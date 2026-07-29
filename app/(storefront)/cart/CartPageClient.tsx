'use client';

import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/ui/EmptyState';

export default function CartPageClient() {
  const { items, summary, toggleDrawer } = useCart();
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add some items to get started!"
        action={{ label: 'Continue Shopping', href: '/products' }}
        icon={<ShoppingBag className="w-16 h-16" />}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart ({summary.totalQuantity} {summary.totalQuantity === 1 ? 'item' : 'items'})
      </h1>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        <button
          onClick={() => useCartStore.getState().clearCart()}
          className="flex items-center gap-1.5 text-sm text-error hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl divide-y divide-gray-100 px-4">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <CartSummary summary={summary} showCoupon onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} />
          <Link
            href="/checkout"
            className="block w-full text-center py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="block w-full text-center py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
