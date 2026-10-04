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
    <div className="space-y-6">
      <div className="space-y-3">
        <AdminBreadcrumbs />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
      {/* min-w-0: wide tables scroll inside their card instead of widening the page. */}
      <div className="grid gap-6 [&>*]:min-w-0">{children}</div>
    </div>
  );
}
