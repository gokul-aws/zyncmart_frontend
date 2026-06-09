import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/formatters';
import type { Order, OrderStatus } from '@/types/order';

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  placed: 'outline',
  confirmed: 'default',
  processing: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  returned: 'error',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Order Placed',
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

  return (
    <Link
      href={`/account/orders/${order._id}`}
      className="block bg-white border border-gray-100 rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">#{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Item thumbnails */}
      <div className="flex items-center gap-2 mb-3">
        {thumbnails.map((item, idx) => (
          <div key={idx} className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
            <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
          </div>
        ))}
        {extra > 0 && (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium shrink-0">
            +{extra}
          </div>
        )}
        <p className="text-sm text-gray-500 ml-1">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-semibold text-gray-900">{formatPrice(order.pricing.total)}</span>
      </div>
    </Link>
  );
}
