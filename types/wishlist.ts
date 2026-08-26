import type { Product } from './product';

// Product-level only — matches the pre-existing wishlist behavior (no
// variant is ever recorded). `product` is the full Product shape (same as
// GET /products returns) so it can be rendered directly with ProductCard.
export interface WishlistItem {
  _id: string;
  productId: string;
  addedAt: string;
  product: Product;
}

export interface WishlistResponse {
  items: WishlistItem[];
}
