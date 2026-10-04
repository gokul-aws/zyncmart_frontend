// Mirrors the backend order state machine (zyncmart_backend/src/services/
// orderStatus.js) so the admin UI only offers actions the server will accept.
// Display only — the server re-validates every change and stays authoritative.
// Pure (no imports at runtime) so `node --test` can exercise it directly.
import type { Order, OrderStatus } from '@/types/order';

type OrderLike = Pick<Order, 'status'> & { payment: Pick<Order['payment'], 'method' | 'status'> };

const FULFILMENT_PATH: OrderStatus[] = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
const ADMIN_CANCELLABLE: OrderStatus[] = ['placed', 'confirmed', 'processing'];

export const isTerminal = (order: OrderLike) => order.status === 'cancelled' || order.status === 'returned';

/** Statuses an admin may set from the status selector (current status first; cancellation has its own action). */
export function adminStatusOptions(order: OrderLike): OrderStatus[] {
  if (isTerminal(order)) return [order.status];
  const options: OrderStatus[] = [order.status];
  // An online order only moves forward once its payment is confirmed.
  const paymentBlocks = order.payment.method === 'razorpay' && order.payment.status !== 'paid';
  if (!paymentBlocks) {
    const from = FULFILMENT_PATH.indexOf(order.status);
    if (from !== -1) options.push(...FULFILMENT_PATH.slice(from + 1));
  }
  if (order.status === 'delivered') options.push('returned');
  return options;
}

export const canAdminCancel = (order: OrderLike) => ADMIN_CANCELLABLE.includes(order.status);

/** True when cancelling will refund an online payment. */
export const cancellationRefunds = (order: OrderLike) => order.payment.method === 'razorpay' && order.payment.status === 'paid';
