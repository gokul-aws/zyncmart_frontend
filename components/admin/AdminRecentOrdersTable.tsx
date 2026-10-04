'use client';

import Link from 'next/link';
import type { RecentOrder } from '@/types/dashboard';
import Badge from '@/components/ui/Badge';
import { CardHeader } from '@/components/ui/Card';
import { formatPrice, formatDate } from '@/lib/formatters';
import { TABLE, THEAD, TH, TBODY, TR, TD } from './AdminTable';

const ORDER_BADGE_VARIANTS: Record<string, 'success' | 'warning' | 'error' | 'default' | 'neutral'> = {
  placed: 'warning',
  confirmed: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  returned: 'neutral',
};

export default function AdminRecentOrdersTable({ recentOrders }: { recentOrders: RecentOrder[] }) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="px-5 pt-5">
        <CardHeader
          title="Recent orders"
          action={
            <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          }
        />
      </div>
      {recentOrders.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={TABLE}>
            <thead className={THEAD}>
              <tr>
                <th scope="col" className={TH}>Order</th>
                <th scope="col" className={TH}>Customer</th>
                <th scope="col" className={TH}>Status</th>
                <th scope="col" className={`${TH} text-right`}>Total</th>
                <th scope="col" className={TH}>Date</th>
              </tr>
            </thead>
            <tbody className={TBODY}>
              {recentOrders.map((order) => (
                <tr key={order._id} className={TR}>
                  <td className={TD}>
                    <Link href={`/admin/orders/${order._id}`} className="font-medium text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className={TD}>{order.user?.name}</td>
                  <td className={TD}>
                    <Badge variant={ORDER_BADGE_VARIANTS[order.status] ?? 'neutral'}>{order.status}</Badge>
                  </td>
                  <td className={`${TD} text-right tabular-nums`}>{formatPrice(order.pricing.total)}</td>
                  <td className={`${TD} whitespace-nowrap text-muted-foreground`}>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
