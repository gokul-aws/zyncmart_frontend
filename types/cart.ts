export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  stock: number;
  quantity: number;
  variant?: string;
  slug: string;
  // Color variant reference, alongside the generic `variant` label above.
  variantId?: string;
  color?: string;
  colorCode?: string;
  sku?: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}
