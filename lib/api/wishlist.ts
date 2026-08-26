import api from './axios';
import type { WishlistResponse } from '@/types/wishlist';

export async function fetchWishlist(): Promise<WishlistResponse> {
  const { data } = await api.get('/wishlist');
  return data.data as WishlistResponse;
}

export async function addToWishlistServer(productId: string): Promise<void> {
  await api.post('/wishlist', { productId });
}

export async function removeFromWishlistServer(productId: string): Promise<void> {
  await api.delete(`/wishlist/${productId}`);
}
