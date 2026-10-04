import api from './axios';

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber?: string;
  keyId?: string;
  /** End of the order's payment window (null for orders without one). */
  expiresAt?: string | null;
  remainingSeconds?: number | null;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function createPaymentOrder(
  orderId: string
): Promise<CreatePaymentOrderResponse> {
  const { data } = await api.post('/payments/create-order', { orderId });
  return data.data as CreatePaymentOrderResponse;
}

/** Resolves with the server's outcome; `code` is 'PAYMENT_PENDING' when capture is still being confirmed. */
export async function verifyPayment(payload: VerifyPaymentPayload): Promise<{ code?: string }> {
  const { data } = await api.post('/payments/verify', payload);
  return { code: data?.code };
}
