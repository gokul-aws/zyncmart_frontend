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
      <table className="min-w-full table-auto text-left">
        <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
          <tr>
            <th className="px-4 py-4 w-12">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleAll(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
              </label>
            </th>
            <th className="px-4 py-4">Product</th>
            <th className="px-4 py-4">Category</th>
            <th className="px-4 py-4">Price</th>
            <th className="px-4 py-4">Stock</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4">Added</th>
            <th className="px-4 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {products.map((product) => {
            const isSelected = selectedIds.includes(product._id);
            // Get primary image from variants or product images
            const variantImage = product.variants?.[0]?.image;
            const primaryImage =
              product.images.find((image) => image.isPrimary) ??
              product.images[0];
            const displayImage = variantImage
              ? { url: variantImage, publicId: '', isPrimary: true }
              : primaryImage;
            const isVariable = product.productType === 'variable';
            const displayPrice = isVariable
              ? (product.variants?.[0]?.price ?? product.price)
              : product.price;
            const displaySku = isVariable
              ? (product.variants?.[0]?.sku ?? product.sku)
              : product.sku;

            return (
              <tr key={product._id} className={cn(isSelected ? 'bg-slate-50 dark:bg-slate-800' : '')}>
                <td className="px-4 py-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(product._id)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </label>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
                      {displayImage ? (
                        <Image
                          src={displayImage.url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/products/${product.slug}`} className="font-semibold text-slate-900 hover:text-primary dark:text-white dark:hover:text-primary">
                        {product.name}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{truncate(displaySku, 32)}</p>
                      <Badge variant={isVariable ? 'outline' : 'success'} className="mt-1 text-[10px]">
                        {isVariable ? 'Variable' : 'Simple'}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{product.category.name}</td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                  ₹{(displayPrice ?? 0).toLocaleString()}
                  {isVariable && product.variants?.length > 1 && (
                    <span className="ml-1 text-xs text-slate-400">({product.variants.length} variants)</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{product.stock}</td>
                <td className="px-4 py-4">
                  <Badge variant={product.isActive ? 'success' : 'outline'}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {new Date(product.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(product)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    aria-label={product.isActive ? 'Deactivate product' : 'Activate product'}
                  >
                    {product.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>

                  <Link
                    href={`/admin/products/${product.slug}/edit`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    aria-label="Edit product"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>

                  <Link
                    href={`/admin/products/${product.slug}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    aria-label="View product"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDeleteRow(product)}
                    className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-900"
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
  );
}
