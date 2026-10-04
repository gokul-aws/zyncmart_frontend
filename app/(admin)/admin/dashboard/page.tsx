'use client';

import { useMemo } from 'react';
import { useDashboardStats } from '@/hooks/useDashboard';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminRevenueChart from '@/components/admin/AdminRevenueChart';
import AdminRecentOrdersTable from '@/components/admin/AdminRecentOrdersTable';
import AdminTopSellingProducts from '@/components/admin/AdminTopSellingProducts';
import Link from 'next/link';
import { Clock, IndianRupee, Package, ShoppingBag, Users, type LucideIcon } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { CardHeader } from '@/components/ui/Card';
import { formatPrice } from '@/lib/formatters';

const METRICS: { key: string; label: string; icon: LucideIcon; money?: boolean; href?: string }[] = [
  { key: 'totalRevenue', label: 'Total revenue', icon: IndianRupee, money: true },
  { key: 'totalOrders', label: 'Total orders', icon: ShoppingBag, href: '/admin/orders' },
  { key: 'pendingOrders', label: 'Pending orders', icon: Clock, href: '/admin/orders?status=placed' },
  { key: 'totalCustomers', label: 'Customers', icon: Users, href: '/admin/customers' },
  { key: 'totalProducts', label: 'Products', icon: Package, href: '/admin/products' },
];

function metricValue(stats: Record<string, number> | undefined, key: string, money?: boolean) {
  const value = stats?.[key];
  if (value == null) return '—';
  return money ? formatPrice(value) : value.toLocaleString('en-IN');
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardStats();

  const statusSummary = useMemo(() => {
    const statusCounts = data?.orderStatusCounts ?? {};
    return [
      { label: 'Placed', value: statusCounts.placed ?? 0, variant: 'warning' as const },
      { label: 'Processing', value: statusCounts.processing ?? 0, variant: 'warning' as const },
      { label: 'Shipped', value: statusCounts.shipped ?? 0, variant: 'default' as const },
      { label: 'Delivered', value: statusCounts.delivered ?? 0, variant: 'success' as const },
      { label: 'Cancelled', value: statusCounts.cancelled ?? 0, variant: 'error' as const },
    ];
  }, [data]);

  const revenueChartData = useMemo(() => {
    return data?.revenue?.last7Days?.map((day: any) => ({
      label: day.date,
      value: day.revenue
    })) ?? [];
  }, [data]);

  const pipelineTotal = statusSummary.reduce((sum, s) => sum + s.value, 0);

  return (
    <AdminPageShell title="Dashboard" description="Orders, customers and products at a glance.">
      {isError && (
        <Alert
          variant="error"
          title="Dashboard data could not be loaded"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Please check your connection and try again.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {METRICS.map((m) => {
          const Icon = m.icon;
          const body = (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              {isLoading ? (
                <Skeleton className="mt-3 h-8 w-24" />
              ) : (
                <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{metricValue(data?.stats, m.key, m.money)}</p>
              )}
            </>
          );
          return m.href ? (
            <Link key={m.key} href={m.href} className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
              {body}
            </Link>
          ) : (
            <div key={m.key} className="rounded-xl border border-border bg-surface p-5">
              {body}
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border border-border bg-surface p-5">
        <CardHeader title="Order pipeline" description="Orders by current status" />
        {isLoading ? (
          <Skeleton className="h-3 w-full rounded-full" />
        ) : (
          <>
            <div className="flex h-3 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
              {pipelineTotal > 0 &&
                statusSummary.map((s) => (
                  <span key={s.label} className={PIPELINE_COLORS[s.label]} style={{ width: `${(s.value / pipelineTotal) * 100}%` }} />
                ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {statusSummary.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PIPELINE_COLORS[s.label]}`} aria-hidden="true" />
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="ml-auto font-semibold tabular-nums text-foreground">{s.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <AdminRevenueChart data={revenueChartData} />
          <AdminRecentOrdersTable recentOrders={data?.recentOrders ?? []} />
        </div>
        <AdminTopSellingProducts products={data?.topSellingProducts ?? []} />
      </div>
    </AdminPageShell>
  );
}

const PIPELINE_COLORS: Record<string, string> = {
  Placed: 'bg-amber-500',
  Processing: 'bg-sky-500',
  Shipped: 'bg-primary',
  Delivered: 'bg-success',
  Cancelled: 'bg-gray-400',
};
