'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Category } from '@/types/category';
import { useToggleCategoryStatus } from '@/hooks/useAdminCategories';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { AdminTableCard, TABLE, THEAD, TH, TBODY, TR, TD } from '@/components/admin/AdminTable';

interface AdminCategoryTableProps {
  categories: Category[];
  /** Full category list for resolving parent names when `categories` is a filtered/paged subset. */
  allCategories?: Category[];
  isLoading?: boolean;
}

const HEADERS = ['Image', 'Name', 'Parent', 'Sort', 'Status'];
const ACTION = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground';

export default function AdminCategoryTable({ categories, allCategories = categories, isLoading }: AdminCategoryTableProps) {
  const toggleMutation = useToggleCategoryStatus();
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const categoryById = Object.fromEntries(allCategories.map((c) => [c._id, c]));

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
                        onClick={() =>
                          category.isActive
                            ? setPendingDelete(category)
                            : toggleMutation.mutate({ id: category._id, isActive: true })
                        }
                        disabled={toggleMutation.isPending}
                        className={`${ACTION} disabled:opacity-50`}
                        aria-label={`${category.isActive ? 'Deactivate' : 'Activate'} ${category.name}`}
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {category.isActive ? <ToggleRight className="h-4 w-4" aria-hidden="true" /> : <ToggleLeft className="h-4 w-4" aria-hidden="true" />}
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
        description="It will be hidden from the store. You can reactivate it any time from the Inactive filter."
        confirmLabel="Deactivate category"
        destructive
        loading={toggleMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await toggleMutation.mutateAsync({ id: pendingDelete._id, isActive: false });
          } catch {
            // Error toast is shown by the mutation hook.
          } finally {
            setPendingDelete(null);
          }
        }}
      />
    </>
  );
}
