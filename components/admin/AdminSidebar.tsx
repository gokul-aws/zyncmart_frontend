'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ExternalLink, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { ADMIN_MENU_ITEMS, ADMIN_ACTION_ITEMS } from '@/components/admin/adminNavigation';

interface AdminSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

const ITEM = 'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors';

export default function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className={cn('flex h-full w-64 flex-col bg-ink text-white', className)}>
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <Link href="/admin/dashboard" onClick={onNavigate} className="relative block h-8 w-[136px]" aria-label="Zyncmart admin dashboard">
          <Image src="/zyncmart_logo.png" alt="" fill priority sizes="140px" className="object-cover" />
        </Link>
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-semibold text-white/80">Admin</span>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {ADMIN_MENU_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(ITEM, active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white')}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        {ADMIN_ACTION_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(ITEM, active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white')}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        <Link href="/" className={cn(ITEM, 'text-white/70 hover:bg-white/5 hover:text-white')}>
          <ExternalLink className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          View store
        </Link>
        <button type="button" onClick={() => setConfirmLogout(true)} className={cn(ITEM, 'w-full text-white/70 hover:bg-white/5 hover:text-white')}>
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out?"
        description="You'll need to sign in again to use the admin panel."
        confirmLabel="Sign out"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          signOut();
        }}
      />
    </div>
  );
}
