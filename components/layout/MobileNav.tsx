'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, ShoppingCart, User, Package } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';

const BASE_NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Categories', href: '/categories', icon: Grid },
  // { label: 'Search', href: '/search', icon: Search },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Account', href: '/account', icon: User },
] as const;

const ORDERS_ITEM = { label: 'Orders', href: '/my-orders', icon: Package } as const;

export default function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loggedIn = mounted && (typeof isAuthenticated === 'function' ? isAuthenticated() : isAuthenticated);

  const navItems = [
    ...BASE_NAV_ITEMS.slice(0, 3),
    ...(loggedIn ? [ORDERS_ITEM] : []),
    ...BASE_NAV_ITEMS.slice(3),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 flex shadow-[0_-4px_20px_rgba(21,101,216,0.08)]">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-700'
            }`}
            aria-label={label}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {label === 'Cart' && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
