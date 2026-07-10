'use client';

import { ReactNode } from 'react';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';

interface AdminPageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AdminPageShell({ title, description, actions, children }: AdminPageShellProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <AdminBreadcrumbs />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{title}</h1>
            {description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
      <div className="grid gap-6">{children}</div>
    </div>
  );
}
