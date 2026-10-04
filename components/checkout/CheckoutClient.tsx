'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, ChevronDown } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useRazorpay } from '@/hooks/useRazorpay';
import { createOrder, fetchOrderQuote, getApiError } from '@/lib/api/orders';
import { validatePincode } from '@/lib/shipping';
import { GA } from '@/lib/analytics';
import AddressStep from './AddressStep';
import PaymentStep from './PaymentStep';
import OrderSummary from './OrderSummary';
import type { Address } from '@/types/user';

type Step = 'address' | 'payment';

const STEP_LABELS: Record<Step, string> = {
  address: 'Delivery address',
  payment: 'Payment',
};

const STEPS: Step[] = ['address', 'payment'];

export interface CheckoutDestination {
  pincode: string;
  state: string;
}

// Codes for which the server's cart differs from what the customer reviewed:
// reload the cart so they see the corrected items before trying again.
const CART_RELOAD_CODES = new Set(['CART_CHANGED', 'COUPON_INVALID', 'OUT_OF_STOCK', 'CART_EMPTY']);

export default function CheckoutClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Checkout always uses the server-side cart: the server builds the order from
  // it, so the UI must show exactly those items.
  const items = useCartStore((s) => s.items);
  const loadCart = useCartStore((s) => s.loadCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const { initiatePayment } = useRazorpay();

  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [destination, setDestination] = useState<CheckoutDestination>({ pincode: '', state: '' });

  // Every amount shown at checkout comes from the server quote. It is
  // re-requested when the delivery state/pincode or the cart contents change.
  const cartKey = useMemo(() => items.map((i) => `${i._id}:${i.quantity}`).join('|'), [items]);
  const canQuote = validatePincode(destination.pincode) && Boolean(destination.state) && items.length > 0;
  const quoteQuery = useQuery({
    queryKey: ['order-quote', destination.state, destination.pincode, cartKey],
    queryFn: () => fetchOrderQuote(destination),
    enabled: canQuote,
    staleTime: 0,
    retry: false,
  });
  const quote = canQuote ? quoteQuery.data ?? null : null;
  const quoteError = canQuote && quoteQuery.isError
    ? getApiError(quoteQuery.error, 'Could not calculate the total for this address.').message
    : null;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      router.replace('/cart');
      return;
    }
    GA.beginCheckout(items);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddressContinue = (address: Address) => {
    setShippingAddress(address);
    setDestination({ pincode: address.pincode, state: address.state });
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async (paymentMethod: 'razorpay' | 'cod') => {
    if (!shippingAddress) return;

    let order;
    try {
      order = await createOrder({ shippingAddress, paymentMethod });
    } catch (err) {
      const { code, message } = getApiError(err, 'Failed to place order. Please try again.');
      toast.error(message);
      if (code && CART_RELOAD_CODES.has(code)) {
        await loadCart().catch(() => {});
        await quoteQuery.refetch();
      }
      return;
    }

    if (paymentMethod === 'cod') {
      // The server already emptied the cart; this syncs the local store.
      clearCart().catch(() => {});
      router.push(`/checkout/success?orderId=${order._id}`);
      return;
    }

    try {
      await initiatePayment(order._id, order.orderNumber, () => clearCart().catch(() => {}), shippingAddress.phone);
    } catch {
      // errors are toasted inside initiatePayment; order already created
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep);

  if (items.length === 0) return null;

  const summaryProps = {
    quote,
    quoteLoading: canQuote && quoteQuery.isFetching,
    quoteError,
    detectedState: destination.state,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Checkout</h1>

      {/* Step indicator */}
      <ol className="mt-5 flex items-center gap-2 text-sm" aria-label="Checkout steps">
        {STEPS.map((step, idx) => {
          const done = idx < currentStepIndex;
          const current = idx === currentStepIndex;
          return (
            <li key={step} className="flex items-center gap-2" aria-current={current ? 'step' : undefined}>
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  done ? 'bg-success text-white' : current ? 'bg-ink text-white' : 'bg-surface-muted text-muted-foreground'
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : idx + 1}
              </span>
              <span className={cn('font-medium', current ? 'text-foreground' : 'text-muted-foreground')}>
                {STEP_LABELS[step]}
                {done && <span className="sr-only"> (completed)</span>}
              </span>
              {idx < STEPS.length - 1 && <span className={cn('mx-1 h-px w-8 sm:w-12', done ? 'bg-success' : 'bg-border-strong')} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {/* Mobile: order summary collapsed at the top, total always visible. */}
      <details className="group mt-6 rounded-xl border border-border bg-surface lg:hidden">
        <summary className="flex h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            Order summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </span>
          <span className="tabular-nums">{quote ? formatPrice(quote.total) : ''}</span>
        </summary>
        <div className="border-t border-border px-4 pb-4">
          <OrderSummary {...summaryProps} framed={false} />
        </div>
      </details>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          {currentStep === 'address' && (
            <AddressStep
              onContinue={handleAddressContinue}
              onShippingChange={setDestination}
              initialPincode={destination.pincode}
              quotedShipping={quote?.shipping ?? null}
            />
          )}
          {currentStep === 'payment' && shippingAddress && (
            <PaymentStep
              shippingAddress={shippingAddress}
              quote={quote}
              quoteLoading={summaryProps.quoteLoading}
              quoteError={quoteError}
              onBack={() => setCurrentStep('address')}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        <aside className="hidden lg:block" aria-label="Order summary">
          <div className="sticky top-24">
            <OrderSummary {...summaryProps} />
          </div>
        </aside>
      </div>
    </div>
  );
}
