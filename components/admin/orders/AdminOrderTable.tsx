'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/formatters';
import type { Order } from '@/types/order';

const ORDER_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  placed: 'warning',
  confirmed: 'default',
  processing: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  returned: 'error',
};

const PAYMENT_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  refunded: 'error',
};

interface AdminOrderTableProps {
  orders: Order[];
}

export default function AdminOrderTable({ orders }: AdminOrderTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
            <tr>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Order</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Customer</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Items</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Payment</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Total</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                <td className="px-4 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#{order.orderNumber}</td>
                <td className="px-4 py-4 whitespace-nowrap">{order.user?.name ?? 'Guest'}</td>
                <td className="px-4 py-4 whitespace-nowrap">{order.items.length}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={ORDER_BADGE_VARIANTS[order.status] ?? 'default'} className="text-[10px] sm:text-xs">
                    {order.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={PAYMENT_BADGE_VARIANTS[order.payment.status] ?? 'default'} className="text-[10px] sm:text-xs">
                    {order.payment.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{formatPrice(order.pricing.total)}</td>
                <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
