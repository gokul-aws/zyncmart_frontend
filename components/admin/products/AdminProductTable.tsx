'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Pencil, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { Product } from '@/types/product';
import { cn, truncate } from '@/lib/utils';

interface AdminProductTableProps {
  products: Product[];
  selectedIds: string[];
  onToggleRow: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onDeleteRow: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

export default function AdminProductTable({
  products,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onDeleteRow,
  onToggleStatus,
}: AdminProductTableProps) {
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
            <tr>
              <th className="px-4 py-4 w-12">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => onToggleAll(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </label>
              </th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Product</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Category</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Price</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Stock</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Added</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((product) => {
              const isSelected = selectedIds.includes(product._id);
              const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

              return (
                <tr key={product._id} className={cn('hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors', isSelected ? 'bg-slate-50 dark:bg-slate-800' : '')}>
                  <td className="px-4 py-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleRow(product._id)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </label>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400 text-[10px] text-center px-1">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[150px] sm:max-w-[200px]">
                        <Link href={`/admin/products/${product.slug}`} className="block font-semibold text-sm text-slate-900 hover:text-primary dark:text-white dark:hover:text-primary truncate">
                          {product.name}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{product.category.name}</td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">₹{product.price.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{product.stock}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={product.isActive ? 'success' : 'outline'} className="text-[10px] sm:text-xs">
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(product.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(product)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                      aria-label={product.isActive ? 'Deactivate product' : 'Activate product'}
                    >
                      {product.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>

                    <Link
                      href={`/admin/products/${product.slug}/edit`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                      aria-label="Edit product"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/admin/products/${product.slug}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                      aria-label="View product"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDeleteRow(product)}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-900"
                      aria-label="Delete product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
