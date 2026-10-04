'use client';

import { useId, useState } from 'react';
import { formatPrice } from '@/lib/formatters';
import type { CartSummary as CartSummaryType } from '@/types/cart';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CartSummaryProps {
  summary: CartSummaryType;
  showCoupon?: boolean;
  onApplyCoupon?: (code: string) => Promise<boolean> | void;
  onRemoveCoupon?: () => void;
  className?: string;
}

/** All amounts come from the server cart summary; nothing is calculated here except the display-only "add ₹X more" hint. */
export default function CartSummary({ summary, showCoupon = false, onApplyCoupon, onRemoveCoupon, className }: CartSummaryProps) {
  const threshold = summary.freeShippingThreshold ?? 999;
  const orderValue = summary.subtotal - summary.discount;
  const shortfall = Math.max(0, threshold - orderValue);

  return (
    <section aria-labelledby="cart-summary-heading" className={cn('rounded-xl border border-border bg-surface p-5', className)}>
      <h2 id="cart-summary-heading" className="text-base font-semibold text-foreground">
        Order summary
      </h2>

      <dl className="mt-4 space-y-2.5 text-sm tabular-nums">
        <div className="flex justify-between text-muted-foreground">
          <dt>
            Subtotal ({summary.totalQuantity} {summary.totalQuantity === 1 ? 'item' : 'items'})
          </dt>
          <dd className="text-foreground">{formatPrice(summary.subtotal)}</dd>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount{summary.coupon ? ` (${summary.coupon})` : ''}</dt>
            <dd>−{formatPrice(summary.discount)}</dd>
          </div>
        )}

        <div className="flex justify-between text-muted-foreground">
          {/* Without an address the server estimates at the other-states rate; the exact charge (₹40 in Tamil Nadu) is shown at checkout. */}
          <dt>Shipping{summary.shippingEstimated && summary.shipping > 0 ? ' (estimated)' : ''}</dt>
          <dd className={summary.shipping === 0 ? 'font-medium text-success' : 'text-foreground'}>{summary.shipping === 0 ? 'Free' : formatPrice(summary.shipping)}</dd>
        </div>
      </dl>

      {summary.shipping > 0 && shortfall > 0 && (
        <div className="mt-3">
          {/* Free shipping is based on the order value after any coupon. */}
          <p className="text-sm text-muted-foreground">
            Add <span className="font-semibold text-foreground">{formatPrice(shortfall)}</span> more for free shipping
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (orderValue / threshold) * 100)}%` }} />
          </div>
        </div>
      )}

      {showCoupon && <CouponInput coupon={summary.coupon} onApply={onApplyCoupon} onRemove={onRemoveCoupon} />}

      <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
        <span>{summary.shippingEstimated && summary.shipping > 0 ? 'Estimated total' : 'Total'}</span>
        <span className="tabular-nums">{formatPrice(summary.grandTotal)}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Inclusive of all taxes</p>
    </section>
  );
}

function CouponInput({ coupon, onApply, onRemove }: { coupon: string | null; onApply?: (code: string) => Promise<boolean> | void; onRemove?: () => void }) {
  // Hooks first: the previous version called useState after an early return,
  // which breaks React's rules of hooks when a coupon is applied or removed.
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputId = useId();

  if (coupon) {
    return (
      <div className="mt-4 flex items-center justify-between rounded-lg bg-success-subtle px-3 py-2.5 text-sm text-success">
        <span className="font-medium">Coupon {coupon} applied</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="h-8 rounded-md px-2 font-semibold hover:underline">
            Remove
          </button>
        )}
      </div>
    );
  }

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = code.trim();
    if (!value || !onApply) return;
    setBusy(true);
    setError(null);
    const ok = await onApply(value);
    setBusy(false);
    if (ok === false) setError('This code could not be applied. Check it and try again.');
    else setCode('');
  };

  return (
    <form onSubmit={apply} className="mt-4">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        Coupon code
      </label>
      <div className="mt-1.5 flex gap-2">
        <Input
          id={inputId}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          autoCapitalize="characters"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="flex-1"
        />
        <Button type="submit" variant="outline" loading={busy} disabled={!code.trim()}>
          Apply
        </Button>
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </form>
  );
}
