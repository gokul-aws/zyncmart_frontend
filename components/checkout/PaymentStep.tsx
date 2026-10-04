'use client';

import { useState } from 'react';
import { CreditCard, Truck, ChevronLeft, ShieldCheck, Smartphone } from 'lucide-react';
import { RadioCard } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type { Address } from '@/types/user';
import type { OrderQuote } from '@/types/order';
import { formatPrice } from '@/lib/formatters';

interface PaymentStepProps {
  shippingAddress: Address;
  /** Server quote — the only source of the payable total and COD availability. */
  quote: OrderQuote | null;
  quoteLoading?: boolean;
  quoteError?: string | null;
  onBack: () => void;
  onPlaceOrder: (paymentMethod: 'razorpay' | 'cod') => Promise<void>;
}

export default function PaymentStep({
  shippingAddress,
  quote,
  quoteLoading,
  quoteError,
  onBack,
  onPlaceOrder,
}: PaymentStepProps) {
  const total = quote?.total ?? 0;
  const codAvailable = quote?.codAvailable ?? false;
  const codMaxOrderValue = quote?.codMaxOrderValue ?? 10000;
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'cod'>(
    'razorpay'
  );
  // COD may become unavailable after a re-quote; never submit it then.
  const paymentMethod = selectedMethod === 'cod' && !codAvailable ? 'razorpay' : selectedMethod;
  const [placing, setPlacing] = useState(false);
  const canPlaceOrder = Boolean(quote?.canCheckout) && !quoteLoading && !placing;
  const hasCartIssues = Boolean(quote && !quote.canCheckout);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await onPlaceOrder(paymentMethod);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <CreditCard className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        Payment
      </h2>

      {/* Delivery address recap */}
      <div className="flex items-start justify-between gap-4 rounded-xl bg-surface-muted p-4 text-sm text-muted-foreground">
        <div className="min-w-0">
          <p className="mb-1 font-semibold text-foreground">Delivering to</p>
          <p>
            {shippingAddress.name} · {shippingAddress.phone}
          </p>
          <p>
            {shippingAddress.line1}
            {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}, {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
          </p>
        </div>
        <button type="button" onClick={onBack} className="h-9 shrink-0 rounded-md px-2 text-sm font-semibold text-primary hover:underline">
          Change
        </button>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-medium text-foreground">Choose a payment method</legend>

        <RadioCard name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setSelectedMethod('razorpay')}>
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Smartphone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Pay online
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">UPI, cards, net banking and wallets — securely via Razorpay</p>
        </RadioCard>

        <RadioCard
          name="paymentMethod"
          value="cod"
          checked={paymentMethod === 'cod'}
          onChange={() => codAvailable && setSelectedMethod('cod')}
          disabled={!codAvailable}
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Truck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Cash on delivery
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {codAvailable ? 'Pay when your order arrives' : `Not available for orders above ${formatPrice(codMaxOrderValue)}`}
          </p>
        </RadioCard>
      </fieldset>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        Payments are processed securely by Razorpay. We never see your card details.
      </p>

      {(quoteError || hasCartIssues) && (
        <Alert variant="error" live>
          {quoteError ?? 'Some items in your cart changed. Please review your cart before placing the order.'}
        </Alert>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="shrink-0">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <Button size="lg" onClick={handlePlaceOrder} disabled={!canPlaceOrder} loading={placing} className="flex-1">
          {placing
            ? 'Placing order…'
            : !quote
              ? 'Calculating total…'
              : paymentMethod === 'cod'
                ? `Place order · ${formatPrice(total)}`
                : `Pay ${formatPrice(total)}`}
        </Button>
      </div>
    </div>
  );
}
