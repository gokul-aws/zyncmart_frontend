import React, { useState } from 'react';
import { formatPrice } from '@/lib/formatters';
import type { CartSummary as CartSummaryType } from '@/types/cart';

interface CartSummaryProps {
  summary: CartSummaryType;
  showCoupon?: boolean;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
}

export default function CartSummary({ summary, showCoupon = false, onApplyCoupon, onRemoveCoupon }: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({summary.totalQuantity} {summary.totalQuantity === 1 ? 'item' : 'items'})</span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount{summary.coupon ? ` (${summary.coupon})` : ''}</span>
            <span>-{formatPrice(summary.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          {summary.shipping === 0 ? (
            <span className="text-success font-medium">Free</span>
          ) : (
            <span>{formatPrice(summary.shipping)}</span>
          )}
        </div>

        {summary.shipping > 0 && (
          <p className="text-xs text-gray-400">
            Add {formatPrice(999 - summary.subtotal)} more for free shipping
          </p>
        )}
      </div>

      {showCoupon && (
        <CouponInput coupon={summary.coupon} onApply={onApplyCoupon} onRemove={onRemoveCoupon} />
      )}

      <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatPrice(summary.grandTotal)}</span>
      </div>

      <p className="text-xs text-gray-400 text-center">Inclusive of all taxes</p>
    </div>
  );
}

function CouponInput({ coupon, onApply, onRemove }: { coupon: string | null; onApply?: (code: string) => void; onRemove?: () => void }) {
  if (coupon) {
    return (
      <div className="flex items-center justify-between text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
        <span className="font-medium">{coupon} applied</span>
        {onRemove && (
          <button onClick={onRemove} className="text-green-700 hover:text-green-900 font-medium">Remove</button>
        )}
      </div>
    );
  }

  const [code, setCode] = useState('');

  return (
    <div className="flex gap-2 pt-1">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Coupon code"
        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <button
        onClick={() => { if (code && onApply) { onApply(code); setCode(''); } }}
        className="px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors"
      >
        Apply
      </button>
    </div>
  );
}
