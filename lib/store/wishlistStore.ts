import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) =>
        set((state) =>
          state.items.includes(productId)
            ? state
            : { items: [...state.items, productId] }
        ),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((id) => id !== productId) })),

      toggleItem: (productId) => {
        const { items } = get();
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },

      hasItem: (productId) => get().items.includes(productId),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
