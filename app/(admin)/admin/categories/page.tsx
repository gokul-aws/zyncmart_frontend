'use client';

import Link from 'next/link';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminCategoryTable from '@/components/admin/categories/AdminCategoryTable';
import { useAdminCategories } from '@/hooks/useAdminCategories';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useAdminCategories();

  return (
    <AdminPageShell
      title="Categories"
      description="Manage all product categories. Create, edit, or delete categories to organize your store."
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total: {categories.length} categories</p>
        </div>
        <Link
          href="/admin/categories/create"
          className="inline-flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          + Create Category
        </Link>
      </div>

      <AdminCategoryTable categories={categories} isLoading={isLoading} />
    </AdminPageShell>
  );
}
