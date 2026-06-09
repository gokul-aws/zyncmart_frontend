'use client';

import { use } from 'react';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminCategoryForm from '@/components/admin/categories/AdminCategoryForm';
import { useAdminCategories } from '@/hooks/useAdminCategories';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminCategoryEditPage({ params }: EditCategoryPageProps) {
  const { id } = use(params);
  const { data: categories = [], isLoading, isError } = useAdminCategories();

  const category = categories.find((c) => c._id === id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        Loading category…
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
        <p className="text-lg font-semibold">Unable to load category for editing.</p>
        <p className="mt-2 text-sm">Please go back and select another category.</p>
      </div>
    );
  }

  return (
    <AdminPageShell
      title="Edit Category"
      description="Update category name, description, parent, and sort order."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <AdminCategoryForm initialData={category} categories={categories} />
      </div>
    </AdminPageShell>
  );
}
