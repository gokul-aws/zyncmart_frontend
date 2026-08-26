export interface CartItemAttributes {
  color?: string | null;
  colorCode?: string | null;
  size?: string | null;
}

export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  slug: string | null;
  image: string;
  thumbnail: string;
  sku: string | null;
  quantity: number;
  price: number;
  originalPrice: number | null;
  totalPrice: number;
  attributes: CartItemAttributes;
  variant: string | null;
  stock: number;
}

export interface CartSummary {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  coupon: string | null;
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
  // Human-readable notices for anything the backend changed while
  // re-syncing the cart against live product data (item removed, price
  // changed, quantity reduced for insufficient stock).
  notices?: string[];
}
