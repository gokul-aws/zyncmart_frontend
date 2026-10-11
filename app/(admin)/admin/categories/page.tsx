'use client';

import { Suspense, useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminCategoryTable from '@/components/admin/categories/AdminCategoryTable';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import type { Category } from '@/types/category';

const DEFAULT_PAGE_SIZE = 12;

const SELECT =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

const SORTERS: Record<string, (a: Category, b: Category) => number> = {
  order: (a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name),
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
  newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  oldest: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
};

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: categories = [], isLoading, isError, refetch } = useAdminCategories();

  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const search = searchParams.get('search') ?? '';
  // 'top' = top-level only, 'sub' = any subcategory, otherwise a parent category id.
  const parent = searchParams.get('parent') ?? '';
  const sort = searchParams.get('sort') ?? 'order';
  // Default to Active-only, same as the products page.
  const status = searchParams.get('status') ?? 'active';

  // Categories that have at least one child, for the "Parent" dropdown.
  const parentOptions = useMemo(() => {
    const parentIds = new Set(categories.map((c) => c.parent).filter(Boolean));
    return categories.filter((c) => parentIds.has(c._id)).sort(SORTERS['name-asc']);
  }, [categories]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories
      .filter((c) => {
        if (status === 'active' && !c.isActive) return false;
        if (status === 'inactive' && c.isActive) return false;
        if (query && ![c.name, c.slug, c.description ?? ''].some((v) => v.toLowerCase().includes(query))) return false;
        if (parent === 'top') return !c.parent;
        if (parent === 'sub') return Boolean(c.parent);
        if (parent) return c.parent === parent;
        return true;
      })
      .sort(SORTERS[sort] ?? SORTERS.order);
  }, [categories, search, parent, sort, status]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / DEFAULT_PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

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
    router.push(`/admin/categories${queryString ? `?${queryString}` : ''}`);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('search') ?? '').trim();
    handleQueryUpdate({ search: query || undefined, page: '1' });
  };

  return (
    <AdminPageShell
      title="Categories"
      description="Manage all product categories. Create, edit, or delete categories to organize your store."
      actions={
        <Link
          href="/admin/categories/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add category
        </Link>
      }
    >
      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[1fr_auto]">
        {/* key resets the uncontrolled input when filters are cleared */}
        <form key={search} onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
            <input
              name="search"
              defaultValue={search}
              className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Search categories by name, slug or description"
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
          onClick={() => handleQueryUpdate({ search: undefined, parent: undefined, sort: undefined, status: undefined, page: '1' })}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <Filter className="h-4 w-4" />
          Clear filters
        </button>
      </div>

      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Filters</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Refine the category results.</p>
            </div>

            <div>
              <label htmlFor="fld-page-status" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select
                id="fld-page-status"
                value={status}
                onChange={(event) => handleQueryUpdate({ status: event.target.value, page: '1' })}
                className={SELECT}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label htmlFor="fld-page-parent" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Parent</label>
              <select
                id="fld-page-parent"
                value={parent}
                onChange={(event) => handleQueryUpdate({ parent: event.target.value || undefined, page: '1' })}
                className={SELECT}
              >
                <option value="">All categories</option>
                <option value="top">Top-level only</option>
                <option value="sub">Subcategories only</option>
                {parentOptions.length > 0 && (
                  <optgroup label="Children of">
                    {parentOptions.map((categoryItem) => (
                      <option key={categoryItem._id} value={categoryItem._id}>
                        {categoryItem.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="fld-page-sort" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Sort by</label>
              <select
                id="fld-page-sort"
                value={sort}
                onChange={(event) => handleQueryUpdate({ sort: event.target.value === 'order' ? undefined : event.target.value, page: '1' })}
                className={SELECT}
              >
                <option value="order">Sort order</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {totalItems} {totalItems === categories.length ? '' : `of ${categories.length} `}categories
                </p>
                <p className="text-xs text-subtle-foreground dark:text-slate-500">Showing page {page} of {totalPages || 1}</p>
              </div>
              <Badge variant="default">Page size: {DEFAULT_PAGE_SIZE}</Badge>
            </div>
          </div>

          {isError && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
              <p className="font-semibold">Unable to load categories.</p>
              <p className="mt-1 text-sm">Try again in a moment.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading || pageItems.length ? (
            <>
              <AdminCategoryTable categories={pageItems} allCategories={categories} isLoading={isLoading} />

              {!isLoading && (
                <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Page {page} of {totalPages || 1} — {totalItems} categories total.
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
              )}
            </>
          ) : (
            !isError && (
              <EmptyState
                title="No categories found"
                description={
                  categories.length
                    ? 'Try a different search term or clear the filters to see all categories.'
                    : 'No categories yet. Create one to get started.'
                }
                action={{ label: 'Add category', href: '/admin/categories/create' }}
              />
            )
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <AdminPageShell
          title="Categories"
          description="Manage all product categories. Create, edit, or delete categories to organize your store."
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Loading categories…
          </div>
        </AdminPageShell>
      }
    >
      <CategoriesPageContent />
    </Suspense>
  );
}
