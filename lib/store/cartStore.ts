import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, CartSummary } from '@/types/cart';

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string, variantId?: string) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  getSummary: () => CartSummary;
}

// A cart line's identity beyond productId: prefer the color variant's id when
// either side has one (so two colors of the same product stay distinct
// lines), otherwise fall back to the free-text variant label for legacy
// items with only a generic option selected (e.g. Size).
const lineIdentity = (item: Pick<CartItem, 'variant' | 'variantId'>) =>
  item.variantId ?? item.variant ?? '';

const matchItem = (a: CartItem, productId: string, variant?: string, variantId?: string) =>
  a.productId === productId && lineIdentity(a) === (variantId ?? variant ?? '');

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            matchItem(i, item.productId, item.variant, item.variantId)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                matchItem(i, item.productId, item.variant, item.variantId)
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, variant, variantId) =>
        set((state) => ({
          items: state.items.filter((i) => !matchItem(i, productId, variant, variantId)),
        })),

      updateQuantity: (productId, quantity, variant, variantId) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => !matchItem(i, productId, variant, variantId))
              : state.items.map((i) =>
                  matchItem(i, productId, variant, variantId) ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),

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
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
