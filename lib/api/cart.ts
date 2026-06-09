import api from './axios';
import type { CartItem } from '@/types/cart';

export async function mergeCart(items: CartItem[]): Promise<void> {
  await api.post('/cart/merge', { items });
}
