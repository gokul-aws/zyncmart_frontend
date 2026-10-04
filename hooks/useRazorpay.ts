'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { createPaymentOrder, verifyPayment } from '@/lib/api/payments';
import { getApiError } from '@/lib/api/orders';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
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
  /** Seconds until Checkout closes itself (the order's remaining payment window). */
  timeout?: number;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

export function useRazorpay() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearCart = useCartStore((s) => s.clearCart);
  const loadCart = useCartStore((s) => s.loadCart);

  // The order (and its reserved stock) already exists. If payment does not
  // complete now, the customer finishes it from the order page ("Complete
  // Payment") while the 30-minute window lasts.
  const goToOrder = (orderId: string) => router.push(`/account/orders/${orderId}`);

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
    } catch (err) {
      const { code, message } = getApiError(err, 'Failed to start the payment. Please try again.');
      toast.error(message);
      if (code === 'ORDER_NOT_PAYABLE' || code === 'ORDER_ALREADY_PAID') goToOrder(orderId);
      return;
    }

    const { razorpayOrderId, amount, currency, keyId, remainingSeconds } = paymentOrderData;
    if (remainingSeconds === 0) {
      toast.error('The payment window for this order has ended.');
      goToOrder(orderId);
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const options: RazorpayOptions = {
        key: keyId || RAZORPAY_KEY,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: SITE_NAME,
        description: `Order #${orderNumber}`,
        image: '/zyncmart_logo.png',
        ...(typeof remainingSeconds === 'number' ? { timeout: remainingSeconds } : {}),
        handler: async (response) => {
          try {
            const { code } = await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            (onPaymentSuccess ?? clearCart)();
            if (code === 'PAYMENT_PENDING') {
              toast.info('Payment received — we are confirming it with the bank.');
              goToOrder(orderId);
            } else {
              router.push(`/checkout/success?orderId=${orderId}`);
            }
            resolve();
          } catch (err) {
            // The server explains the outcome (e.g. order expired → refund initiated).
            toast.error(getApiError(err, 'Payment verification failed. Contact support if money was debited.').message);
            goToOrder(orderId);
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
            toast.info('Payment not completed. You can complete it from your order within 30 minutes.');
            loadCart().catch(() => {}); // the server cart became this order
            goToOrder(orderId);
            reject(new Error('dismissed'));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      // A failed attempt is not final: Checkout stays open so the customer can
      // try again, and the order keeps its reserved stock until it expires.
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. You can try again.');
      });
      rzp.open();
    });
  };

  return { initiatePayment };
}
