'use client';

import type { TopSellingProduct } from '@/types/dashboard';
import Badge from '@/components/ui/Badge';

interface AdminTopSellingProductsProps {
  products: TopSellingProduct[];
}

export default function AdminTopSellingProducts({ products }: AdminTopSellingProductsProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Top selling products</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Products generating the most orders.</p>
        </div>
        <Badge variant="success" className="uppercase tracking-[0.2em]">Top 10</Badge>
      </div>

      <div className="mt-6 space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No top selling products available yet.</p>
        ) : (
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={product._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{index + 1}. {product.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">{product.unitsSold} sold</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
