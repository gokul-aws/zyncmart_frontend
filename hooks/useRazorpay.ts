'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { createPaymentOrder, verifyPayment } from '@/lib/api/payments';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayCheckoutConfig {
  display: {
    blocks: Record<string, { name: string; instruments: Array<{ method: string }> }>;
    sequence: string[];
    preferences: { show_default_blocks: boolean };
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  customer_id?: string;
  config?: RazorpayCheckoutConfig;
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Shape of the event Razorpay's checkout.js emits on `payment.failed` — never
// includes raw card/CVV data, only the gateway's own error metadata, so it's
// safe to log for debugging.
interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

// We only accept Cards and UPI — this is Razorpay's documented
// config.display mechanism for restricting Checkout's payment method list
// (not a CSS hide, which Razorpay still renders and can flash before styles
// apply). `show_default_blocks: false` means ONLY the blocks listed below
// are shown — Netbanking/Wallets/EMI/Pay Later never appear.
// https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/
const CHECKOUT_METHODS_CONFIG: RazorpayCheckoutConfig = {
  display: {
    blocks: {
      recommended: {
        name: 'Pay via UPI or Card',
        instruments: [{ method: 'upi' }, { method: 'card' }],
      },
    },
    sequence: ['block.recommended'],
    preferences: { show_default_blocks: false },
  },
};

export function useRazorpay() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearCart = useCartStore((s) => s.clearCart);

  const initiatePayment = async (
    orderId: string,
    orderNumber: string,
    onPaymentSuccess?: () => void,
    phone?: string
  ) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    let paymentOrderData;
    try {
      paymentOrderData = await createPaymentOrder(orderId);
    } catch {
      toast.error('Failed to create payment order. Please try again.');
      return;
    }

    const { razorpayOrderId, amount, currency, keyId } = paymentOrderData;

    return new Promise<void>((resolve, reject) => {
      const options: RazorpayOptions = {
        key: keyId || RAZORPAY_KEY,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: SITE_NAME,
        description: `Order #${orderNumber}`,
        image: '/logo.png',
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            (onPaymentSuccess ?? clearCart)();
            router.push(`/checkout/success?orderId=${orderId}`);
            resolve();
          } catch {
            toast.error('Payment verification failed. Contact support if amount was debited.');
            reject(new Error('verification_failed'));
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: phone || user?.phone || '',
        },
        ...(user?.razorpayCustomerId ? { customer_id: user.razorpayCustomerId } : {}),
        theme: { color: '#1565d8' },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled.');
            reject(new Error('dismissed'));
          },
        },
        config: CHECKOUT_METHODS_CONFIG,
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const { code, description, reason, metadata } = response.error ?? {};
        // Non-sensitive gateway metadata only (order/payment IDs, error
        // code/reason) — never card numbers, CVV, or the Razorpay secret.
        console.error('[razorpay] payment.failed', {
          razorpayOrderId: metadata?.order_id ?? razorpayOrderId,
          razorpayPaymentId: metadata?.payment_id,
          code,
          reason,
          description,
        });
        toast.error(description || 'Payment failed. Please try again.');
        reject(new Error('payment_failed'));
      });
      rzp.open();
    });
  };

  return { initiatePayment };
}
