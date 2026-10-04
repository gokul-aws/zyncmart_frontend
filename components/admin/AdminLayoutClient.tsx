'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import Dialog from '@/components/ui/Dialog';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <AdminSidebar />
      </aside>

      {/* Mobile sidebar: modal sheet (focus contained, Esc closes) */}
      <Dialog open={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin menu" side="left" bare className="max-w-64 bg-ink">
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
