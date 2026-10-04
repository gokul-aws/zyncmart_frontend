'use client';

import { type DashboardRevenuePoint } from '@/types/dashboard';
import { CardHeader } from '@/components/ui/Card';
import { formatPrice } from '@/lib/formatters';

/** Last-7-days revenue as labelled bars (values are also listed as text). */
export default function AdminRevenueChart({ data }: { data: DashboardRevenuePoint[] }) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <CardHeader title="Revenue" description="Last 7 days" />
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No revenue data yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((point) => (
            <li key={point.label} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm">
              <span className="text-muted-foreground">{point.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${(point.value / maxValue) * 100}%` }} />
              </span>
              <span className="font-semibold tabular-nums text-foreground">{formatPrice(point.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
