'use client';

import type { RecentOrder } from '@/types/dashboard';
import Badge from '@/components/ui/Badge';

const ORDER_BADGE_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  placed: 'warning',
  confirmed: 'success',
  processing: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  returned: 'error',
};

interface AdminRecentOrdersTableProps {
  recentOrders: RecentOrder[];
}

export default function AdminRecentOrdersTable({ recentOrders }: AdminRecentOrdersTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent orders</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Most recent orders from customers.</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead>
            <tr>
              <th className="py-3 pr-4 font-medium text-slate-500 uppercase">Order</th>
              <th className="py-3 pr-4 font-medium text-slate-500 uppercase">Customer</th>
              <th className="py-3 pr-4 font-medium text-slate-500 uppercase">Status</th>
              <th className="py-3 pr-4 font-medium text-slate-500 uppercase">Total</th>
              <th className="py-3 font-medium text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentOrders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                <td className="py-4 pr-4 font-medium text-slate-900 dark:text-white">{order.orderNumber}</td>
                <td className="py-4 pr-4">{order.user.name}</td>
                <td className="py-4 pr-4">
                  <Badge variant={ORDER_BADGE_VARIANTS[order.status] ?? 'default'}>
                    {order.status}
                  </Badge>
                </td>
                <td className="py-4 pr-4">₹{order.pricing.total.toLocaleString()}</td>
                <td className="py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
