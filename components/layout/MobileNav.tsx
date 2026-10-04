'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useHydrated } from '@/lib/useHydrated';
import { cn } from '@/lib/utils';

// Five destinations (the bottom-nav maximum). Orders, addresses and the
// wishlist live under Account.
const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Categories', href: '/categories', icon: LayoutGrid },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Cart', href: '/cart', icon: ShoppingBag },
  { label: 'Account', href: '/account', icon: User },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const cartCount = hydrated ? itemCount : 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex h-16">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
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
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label === 'Cart' && cartCount > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold leading-none text-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </span>
                {label}
                {label === 'Cart' && cartCount > 0 && <span className="sr-only">, {cartCount} item{cartCount === 1 ? '' : 's'}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
