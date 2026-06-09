'use client';

import { useCartStore } from '@/lib/store/cartStore';

export function useCart() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const getSummary = useCartStore((s) => s.getSummary);

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    summary: getSummary(),
  };
}
