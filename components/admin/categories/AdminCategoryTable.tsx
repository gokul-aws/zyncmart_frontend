'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/types/category';
import { useDeleteCategory } from '@/hooks/useAdminCategories';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { AdminTableCard, TABLE, THEAD, TH, TBODY, TR, TD } from '@/components/admin/AdminTable';

interface AdminCategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
}

const HEADERS = ['Image', 'Name', 'Parent', 'Sort', 'Status'];
const ACTION = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground';

export default function AdminCategoryTable({ categories, isLoading }: AdminCategoryTableProps) {
  const deleteMutation = useDeleteCategory();
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const categoryById = Object.fromEntries(categories.map((c) => [c._id, c]));

  if (!isLoading && categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong p-8 text-center text-sm text-muted-foreground">
        No categories yet. Create one to get started.
      </div>
    );
  }

  return (
    <>
      <AdminTableCard>
        <table className={TABLE}>
          <thead className={THEAD}>
            <tr>
              {HEADERS.map((h) => (
                <th key={h} scope="col" className={TH}>
                  {h}
                </th>
              ))}
              <th scope="col" className={`${TH} text-right`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={TBODY}>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(HEADERS.length + 1)].map((__, j) => (
                      <td key={j} className={TD}>
                        <Skeleton className={j === 0 ? 'h-10 w-10 rounded-lg' : 'h-4 w-20'} />
                      </td>
                    ))}
                  </tr>
                ))
              : categories.map((category) => (
                  <tr key={category._id} className={TR}>
                    <td className={TD}>
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        {category.image?.url && <Image src={category.image.url} alt="" fill sizes="40px" className="object-cover" />}
                      </div>
                    </td>
                    <td className={TD}>
                      <p className="font-medium text-foreground">{category.name}</p>
                      {category.description && <p className="mt-0.5 max-w-xs truncate text-sm text-muted-foreground">{category.description}</p>}
                    </td>
                    <td className={`${TD} text-muted-foreground`}>{category.parent ? categoryById[category.parent]?.name ?? '—' : '—'}</td>
                    <td className={`${TD} tabular-nums text-muted-foreground`}>{category.sortOrder ?? '—'}</td>
                    <td className={TD}>
                      <Badge variant={category.isActive ? 'success' : 'neutral'}>{category.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className={`${TD} whitespace-nowrap text-right`}>
                      <Link href={`/admin/categories/${category._id}/edit`} className={ACTION} aria-label={`Edit ${category.name}`} title="Edit">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(category)}
                        disabled={deleteMutation.isPending}
                        className={`${ACTION} hover:bg-error-subtle hover:text-error disabled:opacity-50`}
                        aria-label={`Deactivate ${category.name}`}
                        title="Deactivate"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </AdminTableCard>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Deactivate "${pendingDelete?.name ?? ''}"?`}
        // The API deactivates (soft-deletes) categories. Inactive categories are not
        // listed here, and the admin panel has no reactivate control yet.
        description="It will be hidden from the store and from this list. The admin panel can't reactivate categories yet."
        confirmLabel="Deactivate category"
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await deleteMutation.mutateAsync(pendingDelete._id);
          } finally {
            setPendingDelete(null);
          }
        }}
      />
    </>
  );
}
