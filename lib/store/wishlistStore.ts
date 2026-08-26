import { create } from 'zustand';
import { toast } from 'sonner';
import type { WishlistItem } from '@/types/wishlist';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchWishlist, addToWishlistServer, removeFromWishlistServer } from '@/lib/api/wishlist';

interface WishlistStore {
  items: string[]; // productIds — kept for fast synchronous hasItem() checks
  products: WishlistItem[]; // full populated entries, for the wishlist page
  loading: boolean;
  loadWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
}

// The backend is the source of truth — this store is a synced cache, not
// persisted to localStorage. A previous version stored the wishlist purely
// client-side (no auth, no server record), which meant it worked for
// logged-out visitors but wasn't tied to the account, silently diverged
// across devices/browsers, and couldn't be trusted for anything beyond
// local UI state.
export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  items: [],
  products: [],
  loading: false,

  loadWishlist: async () => {
    if (!useAuthStore.getState().accessToken) {
      set({ items: [], products: [], loading: false });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetchWishlist();
      set({
        items: res.items.map((i) => i.productId),
        products: res.items,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  addItem: async (productId) => {
    if (!useAuthStore.getState().accessToken) {
      toast.info('Please log in to save items to your wishlist.');
      return;
    }
    if (get().items.includes(productId)) return;

    const prevItems = get().items;
    set({ items: [...prevItems, productId] });
    try {
      await addToWishlistServer(productId);
      // Pull the populated product summary in so the wishlist page has it
      // without needing a full reload.
      get().loadWishlist().catch(() => {});
    } catch (err) {
      set({ items: prevItems });
      throw err;
    }
  },

  removeItem: async (productId) => {
    const prevItems = get().items;
    const prevProducts = get().products;
    set({
      items: prevItems.filter((id) => id !== productId),
      products: prevProducts.filter((p) => p.productId !== productId),
    });
    try {
      await removeFromWishlistServer(productId);
    } catch (err) {
      set({ items: prevItems, products: prevProducts });
      throw err;
    }
  },

  toggleItem: async (productId) => {
    const { items, addItem, removeItem } = get();
    if (items.includes(productId)) {
      await removeItem(productId);
    } else {
      await addItem(productId);
    }
  },

  hasItem: (productId) => get().items.includes(productId),

  clearWishlist: () => set({ items: [], products: [], loading: false }),
}));
