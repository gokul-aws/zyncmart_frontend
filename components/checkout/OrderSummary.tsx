'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { OrderQuote } from '@/types/order';

interface OrderSummaryProps {
  /** Card frame + heading (desktop sidebar); off inside the mobile disclosure. */
  framed?: boolean;
  /** Server-calculated amounts; null until a delivery state/pincode is known. */
  quote: OrderQuote | null;
  quoteLoading?: boolean;
  quoteError?: string | null;
  detectedState?: string;
}

export default function OrderSummary({ quote, quoteLoading, quoteError, detectedState, framed = true }: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const cartSummary = useCartStore((s) => s.summary);

  // Before an address is entered, show the cart's own server-priced subtotal;
  // shipping and the payable total only ever come from the quote.
  const subtotal = quote?.subtotal ?? cartSummary.subtotal;
  const discount = quote?.discount ?? cartSummary.discount;
  const couponCode = quote?.coupon?.code ?? cartSummary.coupon;

  return (
    <div className={cn('space-y-4', framed && 'rounded-xl border border-border bg-surface p-5')}>
      {framed && <h2 className="text-base font-semibold text-foreground">Order summary</h2>}

      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item._id} className="flex items-start gap-3 py-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
              {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
              <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-md bg-ink px-1 text-xs font-semibold text-white" aria-hidden="true">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-foreground">{item.name}</p>
              {(item.attributes?.color || item.attributes?.size) && (
                <p className="mt-0.5 text-sm text-muted-foreground">{[item.attributes?.color, item.attributes?.size].filter(Boolean).join(' · ')}</p>
              )}
              <p className="sr-only">Quantity {item.quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{formatPrice(item.totalPrice)}</p>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 border-t border-border pt-4 text-sm tabular-nums">
        <div className="flex justify-between text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="text-foreground">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount{couponCode ? ` (${couponCode})` : ''}</dt>
            <dd>−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <dt>Shipping{detectedState ? ` to ${detectedState}` : ''}</dt>
          <dd className="text-foreground">
            {quote ? (quote.shipping === 0 ? 'Free' : formatPrice(quote.shipping)) : quoteLoading ? 'Calculating…' : 'Calculated after address'}
          </dd>
        </div>
      </dl>
      {quoteError && <p className="text-sm font-medium text-error">{quoteError}</p>}
      <div className="flex justify-between border-t border-border pt-4 text-base font-bold text-foreground tabular-nums">
        <span>Total</span>
        <span>{quote ? formatPrice(quote.total) : '—'}</span>
      </div>
      <p className="text-sm text-muted-foreground">Prices include GST.</p>
    </div>
  );
}
