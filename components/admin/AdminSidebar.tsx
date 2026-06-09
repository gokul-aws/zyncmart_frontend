'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_MENU_ITEMS, ADMIN_ACTION_ITEMS } from '@/components/admin/adminNavigation';

interface AdminSidebarProps {
  onClose?: () => void;
  className?: string;
}

export default function AdminSidebar({ onClose, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className={cn("flex flex-col h-full bg-secondary text-white w-64", className)}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="30" height="30" rx="6" fill="#1565d8" />
            <path
              d="M7 8h10.5L8 18.5H18.5"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-bold text-lg tracking-tight">Admin Central</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {ADMIN_MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        {ADMIN_ACTION_ITEMS.map((item) => {
          const ActionIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ActionIcon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              signOut();
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="w-5 h-5 text-rose-300">⏻</span>
          Logout
        </button>
      </div>
    </div>
  );
}
