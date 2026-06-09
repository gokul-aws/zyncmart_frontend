'use client';

import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminCategoryForm from '@/components/admin/categories/AdminCategoryForm';
import { useAdminCategories } from '@/hooks/useAdminCategories';

export default function AdminCategoryCreatePage() {
  const { data: categories = [] } = useAdminCategories();

  return (
    <AdminPageShell
      title="Create Category"
      description="Add a new category to organize your store's products."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <AdminCategoryForm categories={categories} />
      </div>
    </AdminPageShell>
  );
}
