'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Search, Heart, LayoutDashboard, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useCategories } from '@/hooks/useCategories';
import { useHydrated } from '@/lib/useHydrated';
import { cn } from '@/lib/utils';
import IconButton from '@/components/ui/IconButton';
import HeaderSearchPanel from './HeaderSearchPanel';

const MAX_NAV_CATEGORIES = 4;

// No display utility here: each link sets its own (inline-flex / hidden …)
// so responsive visibility never conflicts.
const ICON_LINK =
  'relative h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white';

function ZyncmartLogo() {
  // The logo artwork has wide transparent margins; object-cover in a
  // fixed box crops them so the wordmark reads at a sensible size.
  return (
    <Link href="/" className="relative block h-8 w-[136px] shrink-0 sm:h-9 sm:w-[156px]" aria-label="Zyncmart home">
      <Image src="/zyncmart_logo.png" alt="" fill priority sizes="160px" className="object-cover" />
    </Link>
  );
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  // Remounting the panel after it closes gives the next search a clean state.
  const [panelKey, setPanelKey] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const hydrated = useHydrated();

  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const toggleCartDrawer = useCartStore((state) => state.toggleDrawer);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin');
  const { data: categories = [] } = useCategories();
  const navCategories = categories.filter((c) => c.isActive && !c.parent).slice(0, MAX_NAV_CATEGORIES);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setPanelKey((k) => k + 1);
  }, []);
  const toggleSearch = () => (searchOpen ? closeSearch() : setSearchOpen(true));
  // Escape: close and put focus back on whichever trigger is visible.
  const escapeSearch = useCallback(() => {
    closeSearch();
    const trigger = [desktopTriggerRef.current, mobileTriggerRef.current].find((el) => el && el.offsetParent !== null);
    trigger?.focus();
  }, [closeSearch]);

  // Close the search panel when clicking anywhere outside the header.
  useEffect(() => {
    if (!searchOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) closeSearch();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [searchOpen, closeSearch]);

  const cartCount = hydrated ? itemCount : 0;
  const signedIn = hydrated && isAuthenticated;
  const navLink = (href: string) =>
    cn(
      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
      pathname === href ? 'text-white' : 'text-white/75 hover:text-white'
    );

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-ink">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <ZyncmartLogo />

        {/* Desktop: shop navigation from the real category list */}
        <nav className="hidden items-center lg:flex" aria-label="Shop">
          <Link href="/products" className={navLink('/products')} aria-current={pathname === '/products' ? 'page' : undefined}>
            All products
          </Link>
          {navCategories.map((cat) => {
            const href = `/categories/${cat.slug}`;
            return (
              <Link key={cat._id} href={href} className={navLink(href)} aria-current={pathname === href ? 'page' : undefined}>
                {cat.name}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* md+: search reads as a field; opens the live-search panel */}
          <button
            ref={desktopTriggerRef}
            type="button"
            onClick={toggleSearch}
            aria-expanded={searchOpen}
            aria-controls="header-search-panel"
            className="mr-2 hidden h-10 w-56 items-center gap-2 rounded-lg bg-white/10 px-3 text-sm text-white/75 transition-colors hover:bg-white/15 md:flex xl:w-72"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search products…
          </button>
          <IconButton
            label={searchOpen ? 'Close search' : 'Search products'}
            ref={mobileTriggerRef}
            variant="on-dark"
            onClick={toggleSearch}
            aria-expanded={searchOpen}
            aria-controls="header-search-panel"
            className="md:hidden"
          >
            {searchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
          </IconButton>

          {hydrated && isAdmin && (
            <Link href="/admin/dashboard" className={cn(ICON_LINK, 'inline-flex')} aria-label="Admin panel" title="Admin panel">
              <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}

          <Link href="/account/wishlist" className={cn(ICON_LINK, 'hidden sm:inline-flex')} aria-label="Wishlist">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Mobile has Account in the bottom navigation. */}
          <Link href={signedIn ? '/account' : '/login'} className={cn(ICON_LINK, 'hidden md:inline-flex')} aria-label={signedIn ? 'Your account' : 'Sign in'}>
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>

          <IconButton label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`} variant="on-dark" onClick={toggleCartDrawer} className="relative">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold tabular-nums leading-none text-white" aria-hidden="true">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </IconButton>
        </div>
      </div>

      <div id="header-search-panel">
        <HeaderSearchPanel key={panelKey} isOpen={searchOpen} onClose={closeSearch} onEscape={escapeSearch} />
      </div>
    </header>
  );
}
