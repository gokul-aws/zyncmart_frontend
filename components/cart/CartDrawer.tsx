'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatters';
import Dialog from '@/components/ui/Dialog';
import { buttonClasses } from '@/components/ui/Button';
import CartItem from './CartItem';

/** Cart side sheet (native dialog: focus stays inside, Esc closes, page doesn't scroll). */
export default function CartDrawer() {
  const { items, isOpen, toggleDrawer, summary } = useCart();
  const close = () => {
    if (isOpen) toggleDrawer();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      side="right"
      title={`Cart${summary.totalQuantity > 0 ? ` (${summary.totalQuantity})` : ''}`}
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            {/* Server cart summary values only; checkout shows the final quote. */}
            <div className="flex justify-between text-base font-semibold text-foreground tabular-nums">
              <span>Subtotal</span>
              <span>{formatPrice(summary.subtotal)}</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm text-success tabular-nums">
                <span>Discount{summary.coupon ? ` (${summary.coupon})` : ''}</span>
                <span>−{formatPrice(summary.discount)}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Shipping and the final total are confirmed at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={close} className={buttonClasses({ variant: 'outline' })}>
                View cart
              </Link>
              <Link href="/checkout" onClick={close} className={buttonClasses()}>
                Checkout
              </Link>
            </div>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
            <ShoppingBag className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="font-semibold text-foreground">Your cart is empty</p>
          <Link href="/products" onClick={close} className={buttonClasses({ variant: 'outline' })}>
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="-my-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item._id}>
              <CartItem item={item} compact onNavigate={close} />
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
