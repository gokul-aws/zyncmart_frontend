'use client';

import { Menu } from 'lucide-react';
import AdminProfileMenu from '@/components/admin/AdminProfileMenu';
import IconButton from '@/components/ui/IconButton';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

// The previous header had a search box with no behaviour and a notification
// bell with a permanent "unread" dot; both were removed rather than left as
// controls that do nothing.
export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 md:px-6 lg:px-8">
      <IconButton label="Open admin menu" onClick={onMenuClick} className="-ml-2 lg:hidden">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </IconButton>
      <div className="ml-auto">
        <AdminProfileMenu />
      </div>
    </header>
  );
}
