'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Pencil, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { Product } from '@/types/product';
import { truncate } from '@/lib/utils';
import { formatPrice, formatDate } from '@/lib/formatters';
import { AdminTableCard, TABLE, THEAD, TH, TBODY, TR, TD } from '@/components/admin/AdminTable';

interface AdminProductTableProps {
  products: Product[];
  selectedIds: string[];
  onToggleRow: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onDeleteRow: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

const ACTION = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground';

export default function AdminProductTable({ products, selectedIds, onToggleRow, onToggleAll, onDeleteRow, onToggleStatus }: AdminProductTableProps) {
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <AdminTableCard>
      <table className={TABLE}>
        <thead className={THEAD}>
          <tr>
            <th scope="col" className={`${TH} w-12`}>
              <input type="checkbox" checked={allSelected} onChange={(event) => onToggleAll(event.target.checked)} aria-label="Select all products" className="h-4 w-4 accent-primary" />
            </th>
            <th scope="col" className={TH}>Product</th>
            <th scope="col" className={TH}>Category</th>
            <th scope="col" className={`${TH} text-right`}>Price</th>
            <th scope="col" className={`${TH} text-right`}>Stock</th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={TH}>Added</th>
            <th scope="col" className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className={TBODY}>
          {products.map((product) => {
            const isSelected = selectedIds.includes(product._id);
            // Get primary image from variants or product images
            const variantImage = product.variants?.[0]?.image;
            const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
            const displayImage = variantImage ? { url: variantImage, publicId: '', isPrimary: true } : primaryImage;
            const isVariable = product.productType === 'variable';
            const displayPrice = isVariable ? (product.variants?.[0]?.price ?? product.price) : product.price;
            const displaySku = isVariable ? (product.variants?.[0]?.sku ?? product.sku) : product.sku;
            const lowStock = product.stock <= (product.lowStockThreshold ?? 5);

            return (
              <tr key={product._id} className={isSelected ? 'bg-primary-subtle/50' : TR}>
                <td className={TD}>
                  <input type="checkbox" checked={isSelected} onChange={() => onToggleRow(product._id)} aria-label={`Select ${product.name}`} className="h-4 w-4 accent-primary" />
                </td>
                <td className={TD}>
                  <div className="flex min-w-[16rem] items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      {displayImage ? (
                        <Image src={displayImage.url} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${product.slug}`} className="font-medium text-foreground hover:text-primary hover:underline">
                        {product.name}
                      </Link>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        {truncate(displaySku ?? '', 32)}
                        <Badge variant="neutral">{isVariable ? 'Variable' : 'Simple'}</Badge>
                      </p>
                    </div>
                  </div>
                </td>
                <td className={`${TD} whitespace-nowrap text-muted-foreground`}>{product.category?.name}</td>
                <td className={`${TD} whitespace-nowrap text-right tabular-nums`}>
                  {isVariable && product.variants?.length > 1 && <span className="text-muted-foreground">From </span>}
                  {formatPrice(displayPrice ?? 0)}
                  {isVariable && product.variants?.length > 1 && <p className="text-xs text-muted-foreground">{product.variants.length} variants</p>}
                </td>
                <td className={`${TD} text-right tabular-nums ${product.stock === 0 ? 'font-semibold text-error' : lowStock ? 'font-semibold text-warning' : ''}`}>{product.stock}</td>
                <td className={TD}>
                  <Badge variant={product.isActive ? 'success' : 'neutral'}>{product.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className={`${TD} whitespace-nowrap text-muted-foreground`}>{formatDate(product.createdAt)}</td>
                <td className={`${TD} whitespace-nowrap text-right`}>
                  <button type="button" onClick={() => onToggleStatus(product)} className={ACTION} aria-label={`${product.isActive ? 'Deactivate' : 'Activate'} ${product.name}`} title={product.isActive ? 'Deactivate' : 'Activate'}>
                    {product.isActive ? <ToggleRight className="h-4 w-4" aria-hidden="true" /> : <ToggleLeft className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  <Link href={`/admin/products/${product.slug}/edit`} className={ACTION} aria-label={`Edit ${product.name}`} title="Edit">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href={`/admin/products/${product.slug}`} className={ACTION} aria-label={`View ${product.name}`} title="View">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button type="button" onClick={() => onDeleteRow(product)} className={`${ACTION} hover:bg-error-subtle hover:text-error`} aria-label={`Delete ${product.name}`} title="Delete">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AdminTableCard>
  );
}
