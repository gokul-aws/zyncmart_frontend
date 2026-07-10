'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAdminUser, useUpdateAdminUser } from '@/hooks/useAdminUsers';
import AdminPageShell from '@/components/admin/AdminPageShell';
import type { UpdateUserPayload } from '@/lib/api/users';
import { useRouter } from 'next/navigation';

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean(),
});

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user, isLoading, isError, refetch } = useAdminUser(id);
  const updateMutation = useUpdateAdminUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserPayload>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        password: '',
        role: user.role,
        isActive: user.isActive ?? true,
      });
    }
  }, [reset, user]);

  const onSubmit = async (values: UpdateUserPayload) => {
    await updateMutation.mutateAsync({ id, payload: values });
  };

  return (
    <AdminPageShell
      title={user ? `Edit ${user.name}` : 'Edit user'}
      description="Update user profile details, role, or account status."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/admin/customers/${id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          >
            Back to details
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>
      }
    >
      {isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
          <p className="font-semibold">Unable to load user.</p>
          <p className="mt-2 text-sm">Please try again or return to the list.</p>
        </div>
      ) : isLoading || !user ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Loading user details…
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</span>
                <input
                  {...register('name')}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="User full name"
                />
                {errors.name && <p className="mt-2 text-sm text-rose-600">{errors.name.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
                <input
                  {...register('email')}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="user@example.com"
                />
                {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>}
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Phone</span>
                <input
                  {...register('phone')}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Mobile number"
                />
                {errors.phone && <p className="mt-2 text-sm text-rose-600">{errors.phone.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
                <input
                  type="password"
                  {...register('password')}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Enter a new password to reset"
                />
                {errors.password && <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>}
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</span>
                <select
                  {...register('role')}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Account status</span>
                <select
                  {...register('isActive', { setValueAs: (v) => v === 'true' })}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/admin/customers/${id}`}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminPageShell>
  );
}
