'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import CartItem from './CartItem';
import { formatPrice } from '@/lib/formatters';

export default function CartDrawer() {
  const { items, isOpen, toggleDrawer, summary } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleDrawer();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, toggleDrawer]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={toggleDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-gray-900">
              Cart{summary.itemCount > 0 && ` (${summary.itemCount})`}
            </h2>
          </div>
          <button
            onClick={toggleDrawer}
            aria-label="Close cart"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <button
                onClick={toggleDrawer}
                className="text-sm text-primary hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={`${item.productId}-${item.variantId ?? item.variant}`}
                item={item}
                compact
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatPrice(summary.subtotal)}</span>
            </div>
            {summary.shipping === 0 ? (
              <p className="text-xs text-success text-center font-medium">Free shipping applied!</p>
            ) : (
              <p className="text-xs text-gray-400 text-center">
                Add {formatPrice(999 - summary.subtotal)} more for free shipping
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={toggleDrawer}
                className="text-center py-2.5 px-3 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={toggleDrawer}
                className="text-center py-2.5 px-3 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
