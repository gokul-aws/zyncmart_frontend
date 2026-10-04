import { create } from 'zustand';
import type { CartItem, CartSummary, CartResponse } from '@/types/cart';
import { useAuthStore } from '@/lib/store/authStore';
import {
  fetchCart,
  addToCartServer,
  updateCartItemServer,
  removeFromCartServer,
  clearCartServer,
} from '@/lib/api/cart';

interface CartStore {
  items: CartItem[];
  summary: CartSummary;
  isOpen: boolean;
  loading: boolean;
  loadCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, variantId?: string | null) => Promise<void>;
  updateQuantity: (_id: string, quantity: number) => Promise<void>;
  removeItem: (_id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  toggleDrawer: () => void;
  getSummary: () => CartSummary;
}

const emptySummary: CartSummary = {
  totalItems: 0, totalQuantity: 0, subtotal: 0,
  discount: 0, shipping: 0, tax: 0, grandTotal: 0, coupon: null,
};

let requestId = 0;

function withRequest<T>(fn: (id: number) => T): T {
  const id = ++requestId;
  return fn(id);
}

function isLatest(id: number): boolean {
  return id === requestId;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  summary: emptySummary,
  isOpen: false,
  loading: false,

  loadCart: async () => {
    if (!useAuthStore.getState().accessToken) {
      set({ items: [], summary: emptySummary, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const res: CartResponse = await fetchCart();
      set({ items: res.items, summary: res.summary, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  addItem: (productId, quantity, variantId) => withRequest(async (id) => {
    const prev = get().items;
    const prevSummary = get().summary;

    set({ loading: true });
    try {
      const res: CartResponse = await addToCartServer(productId, quantity, variantId);
      if (isLatest(id)) set({ items: res.items, summary: res.summary, loading: false });
    } catch (err) {
      if (isLatest(id)) set({ items: prev, summary: prevSummary, loading: false });
      throw err;
    }
  }),

  updateQuantity: (_id, quantity) => withRequest(async (id) => {
    const prev = get().items;
    const prevSummary = get().summary;

    set({ loading: true });
    try {
      const res: CartResponse = await updateCartItemServer(_id, quantity);
      if (isLatest(id)) set({ items: res.items, summary: res.summary, loading: false });
    } catch (err) {
      if (isLatest(id)) set({ items: prev, summary: prevSummary, loading: false });
      throw err;
    }
  }),

  removeItem: (_id) => withRequest(async (id) => {
    const prev = get().items;
    const prevSummary = get().summary;

    set({ loading: true });
    try {
      const res: CartResponse = await removeFromCartServer(_id);
      if (isLatest(id)) set({ items: res.items, summary: res.summary, loading: false });
    } catch (err) {
      if (isLatest(id)) set({ items: prev, summary: prevSummary, loading: false });
      throw err;
    }
  }),

  clearCart: () => withRequest(async (id) => {
    const prev = get().items;
    const prevSummary = get().summary;

    set({ loading: true });
    try {
      const res: CartResponse = await clearCartServer();
      if (isLatest(id)) set({ items: res.items, summary: res.summary, loading: false });
    } catch (err) {
      if (isLatest(id)) set({ items: prev, summary: prevSummary, loading: false });
      throw err;
    }
  }),

  applyCoupon: async (code: string): Promise<boolean> => {
    try {
      const res: CartResponse = await import('../api/cart').then((m) => m.applyCouponServer(code));
      set({ items: res.items, summary: res.summary });
      return true;
    } catch {
      return false;
    }
  },

  removeCoupon: async () => {
    try {
      const res: CartResponse = await import('../api/cart').then((m) => m.removeCouponServer());
      set({ items: res.items, summary: res.summary });
    } catch {
    }
  },

  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

  getSummary: () => {
    return get().summary;
  },
}));
