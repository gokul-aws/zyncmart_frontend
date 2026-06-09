'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, UserCheck, UserX } from 'lucide-react';
import { useAdminUser, useUpdateAdminUser } from '@/hooks/useAdminUsers';
import AdminPageShell from '@/components/admin/AdminPageShell';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';
import { useRouter } from 'next/navigation';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

const ROLE_VARIANTS: Record<string, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  admin: 'success',
  user: 'default',
};

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user, isLoading, isError, refetch } = useAdminUser(id);
  const updateMutation = useUpdateAdminUser();

  const handleToggleActive = async () => {
    if (!user) return;
    await updateMutation.mutateAsync({
      id,
      payload: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: !user.isActive,
      },
    });
  };

  return (
    <AdminPageShell
      title={user ? user.name : 'User details'}
      description="View user profile, account status, and role assignment."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/customers')}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to users
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </button>
        </div>
      }
    >
      {isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
          <p className="font-semibold">Unable to load user.</p>
          <p className="mt-2 text-sm">Please try again or return to the user list.</p>
        </div>
      ) : isLoading || !user ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Loading user details…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Account overview</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">User account details and role permissions.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={ROLE_VARIANTS[user.role] ?? 'default'}>{user.role}</Badge>
                <Badge variant={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                <p className="mt-2 font-semibold text-slate-900 dark:text-white">{user.email}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p>
                <p className="mt-2 font-semibold text-slate-900 dark:text-white">{user.phone ?? 'Not provided'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Role</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account status</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/customers/${id}/edit`}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              >
                Edit user
              </Link>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={updateMutation.isPending}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              >
                {user.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {user.isActive ? 'Deactivate account' : 'Activate account'}
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile summary</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Use this page to review account information and enforce RBAC for administrator access.
              </p>
            </section>
          </aside>
        </div>
      )}
    </AdminPageShell>
  );
}
