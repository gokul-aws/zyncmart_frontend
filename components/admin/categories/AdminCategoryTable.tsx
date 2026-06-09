'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/types/category';
import { useDeleteCategory } from '@/hooks/useAdminCategories';

interface AdminCategoryTableProps {
  categories: Category[];
  isLoading?: boolean;
}

const SKELETON_ROWS = 3;

export default function AdminCategoryTable({ categories, isLoading }: AdminCategoryTableProps) {
  const deleteMutation = useDeleteCategory();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const categoryById = Object.fromEntries(categories.map((c) => [c._id, c]));

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {['Image', 'Name', 'Parent', 'Sort', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(SKELETON_ROWS)].map((_, i) => (
              <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-6 py-4"><div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">No categories found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Image</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Parent</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Sort</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Status</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {categories.map((category) => (
            <tr key={category._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4">
                {category.image?.url ? (
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <Image
                      src={category.image.url}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                    —
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{category.name}</p>
                {category.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs truncate">
                    {category.description}
                  </p>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {category.parent ? (categoryById[category.parent]?.name ?? <span className="text-slate-400">—</span>) : <span className="text-slate-400">—</span>}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {category.sortOrder ?? '—'}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex gap-2 justify-center">
                  <Link
                    href={`/admin/categories/${category._id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
