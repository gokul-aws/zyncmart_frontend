import type { CheckoutIssue } from './order';

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
  stock: { sku: string; stock: number } | null;
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
  /** True until a delivery address is known; checkout shows the exact quote. */
  shippingEstimated?: boolean;
  freeShippingThreshold?: number;
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
  /** Lines removed / quantities reduced / coupon dropped by the server. */
  notices?: CheckoutIssue[];
}
