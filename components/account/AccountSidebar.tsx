'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, MapPin, Heart, User, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Profile', href: '/account', icon: User },
  { label: 'Password', href: '/account/change-password', icon: KeyRound },
];

const isActive = (pathname: string, href: string) => pathname === href || (href !== '/account' && pathname.startsWith(href));

/** Account navigation: sidebar on large screens, scrollable tab bar on smaller ones. */
export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Small screens */}
      <nav aria-label="Account" className="scrollbar-hide -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
                active ? 'border-ink bg-ink text-white' : 'border-border-strong bg-surface text-foreground hover:bg-surface-muted'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Large screens */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="truncate font-semibold text-foreground">{user?.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <nav aria-label="Account" className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                  active ? 'bg-surface-muted text-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={signOut}
            className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-error transition-colors hover:bg-error-subtle"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </nav>
      </aside>
    </>
  );
}
