'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_BREADCRUMB_TITLES } from '@/components/admin/adminNavigation';

export default function AdminBreadcrumbs() {
  const pathname = usePathname() || '/admin/dashboard';
  const segments = pathname.split('/').filter(Boolean);
  const crumbSegments = segments.slice(1); // remove leading admin

  const crumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }];

  if (crumbSegments.length === 1 && crumbSegments[0] === 'dashboard') {
    // Already at the dashboard root
    return (
      <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-white">Dashboard</span>
        </div>
      </div>
    );
  }

  if (crumbSegments.length > 0) {
    let runningPath = '/admin';
    crumbSegments.forEach((segment) => {
      runningPath += `/${segment}`;
      crumbs.push({
        label: ADMIN_BREADCRUMB_TITLES[segment] ?? segment.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        href: runningPath,
      });
    });
  }

  return (
    <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
      <div className="flex flex-wrap items-center gap-2">
        {crumbs.map((crumb, index) => (
          <span key={crumb.href} className="inline-flex items-center gap-2">
            {index > 0 && <span className="text-slate-300">/</span>}
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-slate-900 dark:text-white">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-primary transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
