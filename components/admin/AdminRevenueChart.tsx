'use client';

import { type DashboardRevenuePoint } from '@/types/dashboard';

interface AdminRevenueChartProps {
  data: DashboardRevenuePoint[];
}

export default function AdminRevenueChart({ data }: AdminRevenueChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Revenue analytics</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Last 7 days revenue breakdown.</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {data.map((point) => (
          <div key={point.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{point.label}</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{point.value.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(point.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
