'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useBuyNowStore } from '@/lib/store/buyNowStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import { createOrder, cartItemsToOrderItems } from '@/lib/api/orders';
import { GA } from '@/lib/analytics';
import AddressStep from './AddressStep';
import PaymentStep from './PaymentStep';
import OrderSummary from './OrderSummary';
import type { Address } from '@/types/user';

type Step = 'address' | 'payment';

const STEP_LABELS: Record<Step, string> = {
  address: 'Delivery Address',
  payment: 'Payment',
};

const STEPS: Step[] = ['address', 'payment'];

export interface CheckoutShipping {
  pincode: string;
  state: string;
  shippingCharge: number;
}

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const cartItems = useCartStore((s) => s.items);
  const cartGetSummary = useCartStore((s) => s.getSummary);
  const cartClear = useCartStore((s) => s.clearCart);
  const cartLoad = useCartStore((s) => s.loadCart);
  const buyNowItems = useBuyNowStore((s) => s.items);
  const buyNowGetSummary = useBuyNowStore((s) => s.getSummary);
  const buyNowClear = useBuyNowStore((s) => s.clear);

  const items = isBuyNow ? buyNowItems : cartItems;
  const getSummary = isBuyNow ? buyNowGetSummary : cartGetSummary;
  const clearCheckoutItems = isBuyNow ? buyNowClear : cartClear;
  const { initiatePayment } = useRazorpay();
  const guard = useSubmitGuard();

  const [currentStep, setCurrentStep] = useState<Step>('address');
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [checkoutShipping, setCheckoutShipping] = useState<CheckoutShipping>({
    pincode: '',
    state: '',
    shippingCharge: 0,
  });
  // Set once a Razorpay order has been created for this checkout attempt.
  // Retrying after a dismissed/failed payment reuses it (POST /payments/create-order
  // is idempotent per order) instead of placing a brand-new order — otherwise
  // every retry click would deduct stock again for an order that never gets paid.
  const [pendingRazorpayOrder, setPendingRazorpayOrder] = useState<{
    _id: string;
    orderNumber: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      router.replace('/cart');
      return;
    }
    // Re-sync against live product data (price/stock may have changed since
    // it was added) — surfaces as the same toasts the cart page shows, so a
    // stale price/quantity is caught before payment rather than only at the
    // final createOrder rejection. Buy Now's single item is already fresh
    // from the product page moments ago, so there's nothing to refresh.
    if (!isBuyNow) {
      cartLoad().catch(() => {});
    }
    GA.beginCheckout(items);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { subtotal, discount, coupon } = getSummary();
  const shipping = checkoutShipping.shippingCharge;
  const total = Math.max(0, subtotal - discount + shipping);
  const pricing = { subtotal, discount, shipping, tax: 0, total };

  const handleAddressContinue = (address: Address) => {
    setShippingAddress(address);
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guarded against a fast double-click/double-submit firing this twice
  // before React re-renders the disabled button — same pattern used for the
  // auth forms (see useSubmitGuard). Without it, COD in particular could
  // create two real orders from one double-click (Razorpay's own modal
  // naturally prevents a second charge, but COD has no such gate).
  const handlePlaceOrder = (paymentMethod: 'razorpay' | 'cod') => guard(async () => {
    if (!shippingAddress) return;

    let order;
    if (paymentMethod === 'razorpay' && pendingRazorpayOrder) {
      order = pendingRazorpayOrder;
    } else {
      try {
        order = await createOrder({
          items: cartItemsToOrderItems(items),
          shippingAddress,
          paymentMethod,
          pricing,
          couponCode: coupon ?? undefined,
        });
      } catch {
        toast.error('Failed to place order. Please try again.');
        return;
      }
      if (paymentMethod === 'razorpay') {
        setPendingRazorpayOrder({ _id: order._id, orderNumber: order.orderNumber });
      }
    }

    if (paymentMethod === 'cod') {
      clearCheckoutItems();
      router.push(`/checkout/success?orderId=${order._id}`);
      return;
    }

    try {
      await initiatePayment(order._id, order.orderNumber, clearCheckoutItems, shippingAddress.phone);
    } catch {
      // errors are toasted inside initiatePayment; order already created — the next
      // "Pay" click retries this same order instead of placing a new one.
    }
  });

  const currentStepIndex = STEPS.indexOf(currentStep);

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Step indicator */}
        <nav className="flex items-center gap-0 mb-8">
          {STEPS.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                    idx < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : idx === currentStepIndex
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStepIndex ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    idx === currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 sm:w-12 mx-2 shrink-0 transition-colors ${
                    idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {currentStep === 'address' && (
                <AddressStep
                  onContinue={handleAddressContinue}
                  onShippingChange={setCheckoutShipping}
                  initialPincode={checkoutShipping.pincode}
                  subtotal={subtotal}
                />
              )}
              {currentStep === 'payment' && shippingAddress && (
                <PaymentStep
                  shippingAddress={shippingAddress}
                  total={total}
                  onBack={() => setCurrentStep('address')}
                  onPlaceOrder={handlePlaceOrder}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <OrderSummary
                shippingCharge={checkoutShipping.shippingCharge}
                detectedState={checkoutShipping.state}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
