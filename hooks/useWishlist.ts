'use client';

import { useWishlistStore } from '@/lib/store/wishlistStore';

export function useWishlist() {
  const items = useWishlistStore((s) => s.items);
  const products = useWishlistStore((s) => s.products);
  const loading = useWishlistStore((s) => s.loading);
  const loadWishlist = useWishlistStore((s) => s.loadWishlist);
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const hasItem = useWishlistStore((s) => s.hasItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  return { items, products, loading, loadWishlist, addItem, removeItem, toggleItem, hasItem, clearWishlist };
}
