import { create } from 'zustand';
import type { CartItem, CartSummary } from '@/types/cart';

const BUY_NOW_KEY = 'buy-now-item';

function getLocalBuyNow(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BUY_NOW_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalBuyNow(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  if (items.length > 0) {
    localStorage.setItem(BUY_NOW_KEY, JSON.stringify(items));
  } else {
    localStorage.removeItem(BUY_NOW_KEY);
  }
}

interface BuyNowStore {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  clear: () => void;
  getSummary: () => CartSummary;
}

const emptySummary: CartSummary = {
  totalItems: 0, totalQuantity: 0, subtotal: 0,
  discount: 0, shipping: 0, tax: 0, grandTotal: 0, coupon: null,
};

export const useBuyNowStore = create<BuyNowStore>()((set, get) => ({
  items: getLocalBuyNow(),

  setItems: (items) => {
    set({ items });
    setLocalBuyNow(items);
  },

  clear: () => {
    set({ items: [] });
    setLocalBuyNow([]);
  },

  getSummary: () => {
    const { items } = get();
    if (!items.length) return emptySummary;
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const discount = 0;
    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
    const tax = 0;
    const grandTotal = subtotal - discount + shipping + tax;
    return { totalItems, totalQuantity, subtotal, discount, shipping, tax, grandTotal, coupon: null };
  },
}));
