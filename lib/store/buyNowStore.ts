import { create } from 'zustand';
import type { CartItem, CartSummary } from '@/types/cart';

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;

interface BuyNowStore {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  clear: () => void;
  getSummary: () => CartSummary;
}

export const useBuyNowStore = create<BuyNowStore>()((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  clear: () => set({ items: [] }),
  getSummary: () => {
    const { items } = get();
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    return {
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  },
}));
