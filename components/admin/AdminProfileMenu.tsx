'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';

export default function AdminProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 sm:px-3 sm:py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
      >
        <span className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-white font-semibold uppercase text-xs sm:text-base">
          {user?.name?.charAt(0) ?? 'A'}
        </span>
        <span className="hidden sm:block text-left">
          <span className="block text-sm font-semibold truncate max-w-[100px]">{user?.name ?? 'Admin'}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{user?.role ?? 'Administrator'}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-1 sm:mr-0" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-3xl border border-slate-200 bg-white py-3 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-950 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-700/80">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name ?? 'Admin'}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user?.email ?? 'admin@example.com'}</p>
          </div>
          <div className="py-2">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
