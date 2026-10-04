import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/formatters';
import type { Order, OrderStatus } from '@/types/order';

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'neutral' | 'success' | 'error' | 'warning' | 'outline'> = {
  placed: 'neutral',
  confirmed: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  returned: 'neutral',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const thumbnails = order.items.slice(0, 3);
  const extra = order.items.length - thumbnails.length;
  const paymentPending = order.status === 'placed' && order.payment.method === 'razorpay' && order.payment.status === 'pending';

  return (
    <Link
      href={`/account/orders/${order._id}`}
      className="group block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
      aria-label={`Order ${order.orderNumber}, ${STATUS_LABEL[order.status]}, ${formatPrice(order.pricing.total)}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">#{order.orderNumber}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {paymentPending && <Badge variant="warning">Payment pending</Badge>}
          <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {thumbnails.map((item, idx) => (
          <div key={idx} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
            {item.image && <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />}
          </div>
        ))}
        {extra > 0 && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-sm font-medium text-muted-foreground">+{extra}</div>
        )}
        <p className="ml-1 text-sm text-muted-foreground">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </p>
        <p className="ml-auto text-sm font-semibold tabular-nums text-foreground">{formatPrice(order.pricing.total)}</p>
      </div>
    </Link>
  );
}
