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
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
            <tr>
              <th className="px-4 py-4 font-medium uppercase">Order</th>
              <th className="px-4 py-4 font-medium uppercase">Customer</th>
              <th className="px-4 py-4 font-medium uppercase">Items</th>
              <th className="px-4 py-4 font-medium uppercase">Status</th>
              <th className="px-4 py-4 font-medium uppercase">Payment</th>
              <th className="px-4 py-4 font-medium uppercase">Total</th>
              <th className="px-4 py-4 font-medium uppercase">Date</th>
              <th className="px-4 py-4 font-medium uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">#{order.orderNumber}</td>
                <td className="px-4 py-4">{order.user?.name ?? 'Guest'}</td>
                <td className="px-4 py-4">{order.items.length}</td>
                <td className="px-4 py-4">
                  <Badge variant={ORDER_BADGE_VARIANTS[order.status] ?? 'default'}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={PAYMENT_BADGE_VARIANTS[order.payment.status] ?? 'default'}>
                    {order.payment.status}
                  </Badge>
                </td>
                <td className="px-4 py-4">{formatPrice(order.pricing.total)}</td>
                <td className="px-4 py-4">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
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
