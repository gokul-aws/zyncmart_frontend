'use client';

import AdminPageShell from '@/components/admin/AdminPageShell';
import EmptyState from '@/components/ui/EmptyState';
import { Tag } from 'lucide-react';

export default function AdminCouponsPage() {
  return (
    <AdminPageShell
      title="Coupons"
      description="Create and manage discount coupons for promotions and seasonal offers."
    >
      <EmptyState
        title="Coupons management coming soon"
        description="Coupon dashboards will be available in a future release. Visit the dashboard for sales and inventory insights."
        action={{ label: 'Back to dashboard', href: '/admin/dashboard' }}
        icon={<Tag className="h-12 w-12 text-slate-400" />}
      />
    </AdminPageShell>
  );
}
