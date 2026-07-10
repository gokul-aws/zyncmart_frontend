'use client';

import { useMemo, type FormEvent } from 'react';
import Link from 'next/link';
import { Search, Filter, RefreshCcw, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminUserTable from '@/components/admin/users/AdminUserTable';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import type { AdminUserFilters } from '@/hooks/useAdminUsers';
import type { UserRole } from '@/types/user';

const DEFAULT_PAGE_SIZE = 12;

const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
] as const;

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

import { Suspense } from 'react';

function CustomersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const role = searchParams.get('role') ?? '';
  const status = searchParams.get('status') ?? '';

  const filters = useMemo<AdminUserFilters>(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: search || undefined,
      role: (role || undefined) as UserRole | undefined,
      isActive:
        status === 'active' ? true : status === 'inactive' ? false : undefined,
    }),
    [page, search, role, status]
  );

  const { data, isLoading, isError, refetch } = useAdminUsers(filters);

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
    router.push(`/admin/customers${queryString ? `?${queryString}` : ''}`);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('search') ?? '').trim();
    handleQueryUpdate({ search: query || undefined, page: '1' });
  };

  const handleClearFilters = () => {
    handleQueryUpdate({ search: undefined, role: undefined, status: undefined, page: '1' });
  };

  const totalItems = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.pages ?? 0;

  return (
    <AdminPageShell
      title="Customers"
      description="Manage users, assign roles, and keep customer accounts active."
      actions={
        <Link
          href="/admin/customers/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add user
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
              placeholder="Search users by name or email"
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
          onClick={handleClearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <Filter className="h-4 w-4" /> Clear filters
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Filters</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Filter users by role and account status.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Role</label>
              <select
                value={role}
                onChange={(event) => handleQueryUpdate({ role: event.target.value || undefined, page: '1' })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">All roles</option>
                {USER_ROLES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{totalItems} users</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Showing page {page} of {totalPages || 1}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Page size: {DEFAULT_PAGE_SIZE}</Badge>
              </div>
            </div>
          </div>

          {isError ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
              <p className="font-semibold">Unable to load users.</p>
              <p className="mt-1 text-sm">Try again or refresh the page.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Loading users…
            </div>
          ) : !data?.data.length ? (
            <EmptyState
              title="No users found"
              description="Broaden your search or reset filters to find users."
              action={{ label: 'Clear filters', href: '/admin/customers' }}
            />
          ) : (
            <>
              <AdminUserTable users={data.data} />

              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Page {page} of {totalPages || 1} — {totalItems} users total.
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
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <AdminPageShell
          title="Customers"
          description="Manage users, assign roles, and keep customer accounts active."
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Loading customers…
          </div>
        </AdminPageShell>
      }
    >
      <CustomersPageContent />
    </Suspense>
  );
}
