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
    <div className="space-y-6 sm:space-y-8 pb-10">
      <div className="space-y-3 sm:space-y-4">
        <AdminBreadcrumbs />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            {description && <p className="mt-1.5 sm:mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
      <div className="grid gap-6">{children}</div>
    </div>
  );
}
