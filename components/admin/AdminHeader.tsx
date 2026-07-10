'use client';

import { Bell, Menu, Search } from 'lucide-react';
import AdminProfileMenu from '@/components/admin/AdminProfileMenu';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 dark:bg-slate-950 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="Open dashboard menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex items-center relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search products, orders..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
        </button>

        <span className="hidden xl:block h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <AdminProfileMenu />
      </div>
    </header>
  );
}
