'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { formatPrice } from '@/lib/formatters';

export default function CartPageClient() {
  const { items, summary } = useCart();
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const [confirmClear, setConfirmClear] = useState(false);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse our categories and add something you love."
        action={{ label: 'Start shopping', href: '/products' }}
        icon={<ShoppingBag />}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Cart <span className="text-lg font-medium text-muted-foreground">({summary.totalQuantity} {summary.totalQuantity === 1 ? 'item' : 'items'})</span>
        </h1>
        <button type="button" onClick={() => setConfirmClear(true)} className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-error hover:bg-error-subtle">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4 sm:px-5">
          {items.map((item) => (
            <li key={item._id}>
              <CartItem item={item} />
            </li>
          ))}
        </ul>

        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <CartSummary summary={summary} showCoupon onApplyCoupon={applyCoupon} onRemoveCoupon={removeCoupon} />
          <div className="hidden lg:block">
            <Link href="/checkout" className={buttonClasses({ size: 'lg', fullWidth: true })}>
              Proceed to checkout
            </Link>
          </div>
          <Link href="/products" className={buttonClasses({ variant: 'outline', fullWidth: true })}>
            Continue shopping
          </Link>
        </div>
      </div>

      {/* Mobile: checkout always within reach, above the bottom navigation. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1 tabular-nums">
            <p className="text-sm text-muted-foreground">{summary.shippingEstimated && summary.shipping > 0 ? 'Estimated total' : 'Total'}</p>
            <p className="text-lg font-bold text-foreground">{formatPrice(summary.grandTotal)}</p>
          </div>
          <Link href="/checkout" className={buttonClasses({ size: 'lg' })}>
            Checkout
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear your cart?"
        description="All items will be removed from your cart."
        confirmLabel="Clear cart"
        destructive
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          useCartStore.getState().clearCart();
        }}
      />
    </div>
  );
}
