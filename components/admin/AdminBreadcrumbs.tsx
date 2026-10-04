'use client';

import { usePathname } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ADMIN_BREADCRUMB_TITLES } from '@/components/admin/adminNavigation';

export default function AdminBreadcrumbs() {
  const pathname = usePathname() || '/admin/dashboard';
  const segments = pathname.split('/').filter(Boolean).slice(1); // drop leading "admin"
  if (segments.length <= 1 && (segments[0] ?? 'dashboard') === 'dashboard') return null;

  const items = [{ label: 'Dashboard', href: '/admin/dashboard' }];
  let runningPath = '/admin';
  for (const segment of segments) {
    runningPath += `/${segment}`;
    items.push({
      label: ADMIN_BREADCRUMB_TITLES[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href: runningPath,
    });
  }
  return <Breadcrumbs items={items} />;
}
