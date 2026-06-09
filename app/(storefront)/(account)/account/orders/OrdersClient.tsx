'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { fetchUserOrders } from '@/lib/api/orders';
import OrderCard from '@/components/account/OrderCard';
import EmptyState from '@/components/ui/EmptyState';
import type { OrderStatus } from '@/types/order';

type Filter = 'all' | 'active' | 'delivered' | 'cancelled';

const ACTIVE_STATUSES: OrderStatus[] = ['placed', 'confirmed', 'processing', 'shipped'];

export default function OrdersClient() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchUserOrders,
    staleTime: 30_000,
  });

  const filtered = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ACTIVE_STATUSES.includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled' || o.status === 'returned';
    return true;
  });

  const TABS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-error">Failed to load orders. Please refresh.</p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="No orders found"
          description="Your orders will appear here once you make a purchase."
          action={{ label: 'Start Shopping', href: '/products' }}
          icon={<Package className="w-14 h-14" />}
        />
      )}

      <div className="space-y-3">
        {filtered.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}
