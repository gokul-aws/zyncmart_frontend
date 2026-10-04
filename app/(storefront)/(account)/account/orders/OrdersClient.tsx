'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { fetchUserOrders } from '@/lib/api/orders';
import OrderCard from '@/components/account/OrderCard';
import EmptyState from '@/components/ui/EmptyState';
import type { OrderStatus } from '@/types/order';
import Skeleton from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { cn } from '@/lib/utils';

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
      <h1 className="text-2xl font-bold tracking-tight text-foreground">My orders</h1>

      <div role="group" aria-label="Filter orders" className="scrollbar-hide flex gap-1 overflow-x-auto rounded-lg bg-surface-muted p-1 sm:w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            aria-pressed={filter === tab.key}
            className={cn(
              'h-9 shrink-0 rounded-md px-4 text-sm font-medium transition-colors',
              filter === tab.key ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3" role="status" aria-label="Loading orders">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {isError && <Alert variant="error" title="Orders could not be loaded">Please refresh the page to try again.</Alert>}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          compact
          title={filter === 'all' ? 'No orders yet' : 'No orders here'}
          description={filter === 'all' ? 'Your orders will appear here once you make a purchase.' : 'Try another filter.'}
          action={filter === 'all' ? { label: 'Start shopping', href: '/products' } : undefined}
          icon={<Package />}
        />
      )}

      <ul className="space-y-3">
        {filtered.map((order) => (
          <li key={order._id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
    </div>
  );
}
