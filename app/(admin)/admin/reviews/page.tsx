'use client';

import AdminPageShell from '@/components/admin/AdminPageShell';
import EmptyState from '@/components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';

export default function AdminReviewsPage() {
  return (
    <AdminPageShell
      title="Reviews"
      description="Manage customer reviews, moderate content, and remove inappropriate feedback."
    >
      <EmptyState
        title="Reviews management coming soon"
        description="The reviews admin console is not implemented yet. Check back after the next release."
        action={{ label: 'Refresh dashboard', href: '/admin/dashboard' }}
        icon={<MessageSquare className="h-12 w-12 text-slate-400" />}
      />
    </AdminPageShell>
  );
}
