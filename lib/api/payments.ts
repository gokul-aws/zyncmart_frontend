import api from './axios';

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber?: string;
  keyId?: string;
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

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<void> {
  await api.post('/payments/verify', payload);
}
