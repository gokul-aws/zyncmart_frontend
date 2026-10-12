'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Package, Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mirrors the header's main tabs (About Us swapped for My Orders), plus
// Account — the header hides its account icon below md. Search and cart stay
// in the header on mobile.
const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop All', href: '/products', icon: Store },
  { label: 'Categories', href: '/categories', icon: LayoutGrid },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'Account', href: '/account', icon: User },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  // Longest matching href wins, so /account/orders highlights My Orders, not Account.
  const activeHref = NAV_ITEMS.map((item) => item.href)
    .filter((href) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex h-16">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = href === activeHref;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
