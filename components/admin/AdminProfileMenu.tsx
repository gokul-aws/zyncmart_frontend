'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
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
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-11 items-center gap-2 rounded-full pl-1 pr-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink font-semibold uppercase text-white" aria-hidden="true">
          {user?.name?.charAt(0) ?? 'A'}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold">{user?.name ?? 'Admin'}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user?.name ?? 'Admin'}</p>
            {user?.email && <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</p>}
          </div>
          <div className="py-1">
            <Link role="menuitem" href="/admin/settings" className="flex h-10 items-center gap-3 px-4 text-sm text-foreground hover:bg-surface-muted" onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex h-10 w-full items-center gap-3 px-4 text-sm text-error hover:bg-error-subtle"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
