'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';
import type { User } from '@/types/user';

const ROLE_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  admin: 'success',
  user: 'default',
};

const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  true: 'success',
  false: 'error',
};

interface AdminUserTableProps {
  users: User[];
}

export default function AdminUserTable({ users }: AdminUserTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
            <tr>
              <th className="px-4 py-4 font-medium uppercase">Name</th>
              <th className="px-4 py-4 font-medium uppercase">Email</th>
              <th className="px-4 py-4 font-medium uppercase">Role</th>
              <th className="px-4 py-4 font-medium uppercase">Status</th>
              <th className="px-4 py-4 font-medium uppercase">Created</th>
              <th className="px-4 py-4 font-medium uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{user.name}</td>
                <td className="px-4 py-4 break-all">{user.email}</td>
                <td className="px-4 py-4">
                  <Badge variant={ROLE_BADGE_VARIANTS[user.role] ?? 'outline'}>{user.role}</Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={STATUS_BADGE_VARIANTS[String(user.isActive)] ?? 'outline'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-4">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/customers/${user._id}`}
                    className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
