'use client';

import { Suspense, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminProductTable from '@/components/admin/products/AdminProductTable';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useAdminProducts, useBulkDeleteAdminProducts, useToggleAdminProductStatus } from '@/hooks/useAdminProducts';
import { useCategories } from '@/hooks/useCategories';

const DEFAULT_PAGE_SIZE = 12;

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  // Default to Active-only so deleted/deactivated products (isActive: false)
  // don't show up unless explicitly requested via the Status filter.
  const status = searchParams.get('status') ?? 'active';

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
      page,
      limit: DEFAULT_PAGE_SIZE,
    }),
    [search, category, status, page]
  );

  const { data, isLoading, isError, refetch } = useAdminProducts(filters);
  const { data: categories = [] } = useCategories();
  const bulkDeleteMutation = useBulkDeleteAdminProducts();
  const toggleStatusMutation = useToggleAdminProductStatus();

  const handleQueryUpdate = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const queryString = params.toString();
    router.push(`/admin/products${queryString ? `?${queryString}` : ''}`);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const query = String(formData.get('search') ?? '').trim();
    handleQueryUpdate({ search: query || undefined, page: '1' });
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [page, search, category, status]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data?.data.map((product) => product._id) ?? []);
      return;
    }
    setSelectedIds([]);
  };

  const handleDeleteProduct = async (product: { _id: string; name: string }) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) {
      return;
    }

    await bulkDeleteMutation.mutateAsync([product._id]);
    setSelectedIds((current) => current.filter((id) => id !== product._id));
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm('Delete selected products? This cannot be undone.')) {
      return;
    }

    await bulkDeleteMutation.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  const handleStatusToggle = async (product: { _id: string; isActive: boolean }) => {
    await toggleStatusMutation.mutateAsync({ id: product._id, isActive: !product.isActive });
  };

  const totalItems = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.pages ?? 0;

  return (
    <AdminPageShell
      title="Products"
      description="Create, edit, and manage all product listings in your store."
      actions={
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Search products by name, SKU or tag"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={() => handleQueryUpdate({ search: undefined, category: undefined, status: undefined, page: '1' })}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <Filter className="h-4 w-4" />
          Clear filters
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Filters</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Refine the product results.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Category</label>
              <select
                value={category}
                onChange={(event) => handleQueryUpdate({ category: event.target.value || undefined, page: '1' })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">All categories</option>
                {categories.map((categoryItem) => (
                  <option key={categoryItem._id} value={categoryItem.slug}>
                    {categoryItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select
                value={status}
                onChange={(event) => handleQueryUpdate({ status: event.target.value || undefined, page: '1' })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All statuses (incl. deleted)</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive / deleted</option>
              </select>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{totalItems} products</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Showing page {page} of {totalPages || 1}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Page size: {DEFAULT_PAGE_SIZE}</Badge>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={!selectedIds.length || bulkDeleteMutation.isPending}
                  className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Delete selected
                </button>
              </div>
            </div>
          </div>

          {isError && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
              <p className="font-semibold">Unable to load products.</p>
              <p className="mt-1 text-sm">Try again or adjust your search filters.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Loading products…
            </div>
          ) : data?.data.length ? (
            <>
              <AdminProductTable
                products={data.data}
                selectedIds={selectedIds}
                onToggleRow={handleToggleRow}
                onToggleAll={handleToggleAll}
                onDeleteRow={handleDeleteProduct}
                onToggleStatus={handleStatusToggle}
              />

              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Page {page} of {totalPages || 1} — {totalItems} products total.
                </p>
                <div className="inline-flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => handleQueryUpdate({ page: String(page - 1) })}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => handleQueryUpdate({ page: String(page + 1) })}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="No products found"
              description="Try a different search term or clear the filters to see all products."
              action={{ label: 'Add first product', href: '/admin/products/create' }}
            />
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <AdminPageShell
          title="Products"
          description="Create, edit, and manage all product listings in your store."
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Loading products…
          </div>
        </AdminPageShell>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
