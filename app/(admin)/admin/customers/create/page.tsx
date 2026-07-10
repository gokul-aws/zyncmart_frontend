'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreateAdminUser } from '@/hooks/useAdminUsers';
import { useMemo } from 'react';
import { z } from 'zod';
import AdminPageShell from '@/components/admin/AdminPageShell';
import type { CreateUserPayload } from '@/lib/api/users';
import { useRouter } from 'next/navigation';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean(),
});

export default function CreateUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateAdminUser();

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<CreateUserPayload>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'admin',
      isActive: true,
    },
  });

  const role = watch('role');

  const onSubmit = async (values: CreateUserPayload) => {
    await createUserMutation.mutateAsync(values);
  };

  const roleLabel = useMemo(
    () => (role === 'admin' ? 'Admin' : 'User'),
    [role]
  );

  return (
    <AdminPageShell
      title="Create user"
      description="Create a new customer or administrator account."
      actions={
        <button
          type="button"
          onClick={() => router.push('/admin/customers')}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
        >
          Back to users
        </button>
      }
    >
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
                placeholder="Password"
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

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            Creating a {roleLabel} account will allow the user to sign in with the assigned credentials.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/customers')}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createUserMutation.isPending}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create user
            </button>
          </div>
        </form>
      </div>
    </AdminPageShell>
  );
}
