import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';
import type { Order } from '@/types/order';

declare function gtag(...args: unknown[]): void;

const safe = (fn: () => void) => {
  if (typeof window === 'undefined') return;
  if (typeof gtag === 'undefined') return;
  try {
    fn();
  } catch {
    // analytics errors are non-fatal
  }
};

export const GA = {
  viewItem: (product: Product) =>
    safe(() =>
      gtag('event', 'view_item', {
        currency: 'INR',
        value: product.price,
        items: [
          {
            item_id: product._id,
            item_name: product.name,
            item_category: product.category.name,
            price: product.price,
          },
        ],
      })
    ),

  addToCart: (product: Product, quantity: number) =>
    safe(() =>
      gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: product.price * quantity,
        items: [
          {
            item_id: product._id,
            item_name: product.name,
            item_category: product.category.name,
            price: product.price,
            quantity,
          },
        ],
      })
    ),

  beginCheckout: (items: CartItem[]) =>
    safe(() =>
      gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: items.reduce((s, i) => s + i.price * i.quantity, 0),
        items: items.map((i) => ({
          item_id: i.productId,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      })
    ),

  purchase: (order: Order) =>
    safe(() =>
      gtag('event', 'purchase', {
        transaction_id: order.orderNumber,
        value: order.pricing.total,
        currency: 'INR',
        shipping: order.pricing.shipping,
        items: order.items.map((i) => ({
          item_id: i.product,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      })
    ),
};
