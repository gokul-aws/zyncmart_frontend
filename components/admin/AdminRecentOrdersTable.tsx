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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent orders</p>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Most recent orders from customers.</p>
        </div>
      </div>

      <div className="mt-6 -mx-5 sm:mx-0 overflow-x-auto scrollbar-hide">
        <div className="inline-block min-w-full align-middle px-5 sm:px-0">
          <table className="min-w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 pr-4 font-medium text-slate-500 uppercase tracking-wider">Order</th>
                <th className="py-3 pr-4 font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="py-3 pr-4 font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 pr-4 font-medium text-slate-500 uppercase tracking-wider">Total</th>
                <th className="py-3 font-medium text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                  <td className="py-4 pr-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{order.orderNumber}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">{order.user.name}</td>
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <Badge variant={ORDER_BADGE_VARIANTS[order.status] ?? 'default'} className="text-[10px] sm:text-xs">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">₹{order.pricing.total.toLocaleString()}</td>
                  <td className="py-4 whitespace-nowrap text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
