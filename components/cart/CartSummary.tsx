import { formatPrice } from '@/lib/formatters';
import type { CartSummary as CartSummaryType } from '@/types/cart';

interface CartSummaryProps {
  summary: CartSummaryType;
  showCoupon?: boolean;
}

export default function CartSummary({ summary, showCoupon = false }: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})</span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>

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
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Coupon code"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button className="px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary-light transition-colors">
            Apply
          </button>
        </div>
      )}

      <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatPrice(summary.total)}</span>
      </div>

      <p className="text-xs text-gray-400 text-center">Inclusive of all taxes</p>
    </div>
  );
}
