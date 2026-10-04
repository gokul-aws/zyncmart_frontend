'use client';

import type { TopSellingProduct } from '@/types/dashboard';
import { CardHeader } from '@/components/ui/Card';
import { formatPrice } from '@/lib/formatters';

export default function AdminTopSellingProducts({ products }: { products: TopSellingProduct[] }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <CardHeader title="Top selling products" description="By units sold" />
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sales yet.</p>
      ) : (
        <ol className="divide-y divide-border">
          {products.map((product, index) => (
            <li key={product._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="w-5 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.sku}</p>
              </div>
              <div className="text-right tabular-nums">
                <p className="text-sm font-semibold text-foreground">{product.unitsSold} sold</p>
                <p className="text-sm text-muted-foreground">{formatPrice(product.revenue)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
