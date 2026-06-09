'use client';

import { useMemo } from 'react';
import { useDashboardStats } from '@/hooks/useDashboard';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminRevenueChart from '@/components/admin/AdminRevenueChart';
import AdminRecentOrdersTable from '@/components/admin/AdminRecentOrdersTable';
import AdminTopSellingProducts from '@/components/admin/AdminTopSellingProducts';
import Badge from '@/components/ui/Badge';

const metricCards = [
  { key: 'totalOrders', label: 'Total orders', prefix: '', suffix: '', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  { key: 'totalRevenue', label: 'Total revenue', prefix: '₹', suffix: '', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { key: 'totalCustomers', label: 'Total customers', prefix: '', suffix: '', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' },
  { key: 'totalProducts', label: 'Total products', prefix: '', suffix: '', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  { key: 'pendingOrders', label: 'Pending orders', prefix: '', suffix: '', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
];

function renderMetricValue(key: string, stats: any) {
  const value = stats?.[key];
  if (key === 'totalRevenue') {
    return value != null ? `₹${value.toLocaleString()}` : '—';
  }
  return value != null ? value.toLocaleString() : '—';
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

  return (
    <AdminPageShell
      title="Dashboard"
      description="Monitor orders, customers, and product performance from one central place."
    >
      {isError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/20 dark:text-rose-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Unable to load dashboard data.</p>
              <p className="text-sm text-rose-600 dark:text-rose-300">Please try again or check your network connection.</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[repeat(3,1fr)] xl:grid-rows-[auto_minmax(0,1fr)]">
        {metricCards.map((card) => (
          <div
            key={card.key}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  {isLoading ? 'Loading…' : renderMetricValue(card.key, data)}
                </p>
              </div>
              <div className={`rounded-3xl px-3 py-2 text-xs font-semibold ${card.color}`}>
                {card.label === 'Pending orders' ? 'Action' : 'Summary'}
              </div>
            </div>
          </div>
        ))}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Order status</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A quick look at the current order pipeline.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {statusSummary.map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{isLoading ? '—' : item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <AdminRevenueChart data={data?.revenueAnalytics ?? []} />
          <AdminRecentOrdersTable recentOrders={data?.recentOrders ?? []} />
        </div>

        <AdminTopSellingProducts products={data?.topSellingProducts ?? []} />
      </div>
    </AdminPageShell>
  );
}
