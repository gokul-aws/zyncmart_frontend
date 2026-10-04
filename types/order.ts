import type { Address } from './user';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

// refund_pending: money was taken but is being returned (cancelled paid order,
// or a payment that arrived after the order expired / was cancelled).
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'refund_pending';

export interface OrderRefund {
  paymentId: string;
  refundId?: string | null;
  amountPaise: number;
  reason: 'cancellation' | 'late_payment' | 'duplicate_payment' | 'amount_mismatch' | 'external';
  status: 'requested' | 'processing' | 'pending' | 'processed' | 'failed';
  processedAt?: string | null;
}
export type PaymentMethod = 'razorpay' | 'cod';

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  variantId?: string;
  color?: string;
  colorCode?: string;
  sku?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    razorpayOrderId?: string;
    paidAt?: string;
    attempts?: number;
    refunds?: OrderRefund[];
    capturedAmountPaise?: number;
    /** Set by the server for late / duplicate / mismatched payments and failed refunds. */
    reviewRequired?: boolean;
    reviewReason?: string;
  };
  status: OrderStatus;
  coupon?: { code: string; type: 'percentage' | 'fixed'; value: number; discount: number };
  reservation?: { reservedAt?: string; expiresAt?: string | null; consumedAt?: string | null; releasedAt?: string | null };
  /** Present on cancelled orders; reason 'payment_timeout' means the payment window expired. */
  cancellation?: { reason: 'customer' | 'admin' | 'payment_timeout'; by: string; at: string; note?: string };
  tracking?: { carrier: string; trackingNumber: string; url: string };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

/** A cart line or coupon the server could not use as-is (see POST /orders/quote). */
export interface CheckoutIssue {
  type: 'removed' | 'quantity_reduced' | 'coupon_removed';
  reason?: string;
  cartItemId?: string | null;
  name?: string;
  code?: string;
  requested?: number;
  available?: number;
}

/** Server-calculated checkout amounts — the only figures the UI should display. */
export interface OrderQuote {
  items: Array<{
    cartItemId: string | null;
    productId: string;
    variantId: string | null;
    name: string;
    slug: string | null;
    sku: string | null;
    image: string | null;
    color: string | null;
    colorCode: string | null;
    size: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  issues: CheckoutIssue[];
  coupon: { code: string; type: 'percentage' | 'fixed'; value: number; discount: number } | null;
  subtotal: number;
  discount: number;
  shipping: number;
  shippingRegion: 'TAMIL_NADU' | 'OTHER_STATE' | 'UNKNOWN';
  freeShipping: boolean;
  freeShippingThreshold: number;
  tax: number;
  codFee: number;
  codAvailable: boolean;
  codMaxOrderValue: number;
  total: number;
  currency: 'INR';
  canCheckout: boolean;
}
