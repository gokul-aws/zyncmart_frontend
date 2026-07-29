import api from './axios';
import type { CartResponse } from '@/types/cart';

export async function fetchCart(): Promise<CartResponse> {
  const { data } = await api.get('/cart');
  return data.data;
}

export async function addToCartServer(
  productId: string,
  quantity: number,
  variantId?: string | null,
): Promise<CartResponse> {
  const { data } = await api.post('/cart/add', { productId, quantity, variantId: variantId ?? null });
  return data.data;
}

export async function updateCartItemServer(
  itemId: string,
  quantity: number,
): Promise<CartResponse> {
  const { data } = await api.patch(`/cart/item/${itemId}`, { quantity });
  return data.data;
}

export async function removeFromCartServer(
  itemId: string,
): Promise<CartResponse> {
  const { data } = await api.delete(`/cart/item/${itemId}`);
  return data.data;
}

export async function clearCartServer(): Promise<CartResponse> {
  const { data } = await api.delete('/cart/clear');
  return data.data;
}

export async function applyCouponServer(code: string): Promise<CartResponse> {
  const { data } = await api.post('/cart/apply-coupon', { code });
  return data.data;
}

export async function removeCouponServer(): Promise<CartResponse> {
  const { data } = await api.delete('/cart/remove-coupon');
  return data.data;
}
