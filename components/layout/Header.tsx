'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Heart, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import HeaderSearchPanel from './HeaderSearchPanel';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'All Products', href: '/products' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
];

function ZyncmartLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Zyncmart — Home">
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="30" height="30" rx="6" fill="#1565d8" />
        <path
          d="M7 8h10.5L8 18.5H18.5"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10.5" cy="23" r="1.5" fill="#4da6ff" />
        <circle cx="17.5" cy="23" r="1.5" fill="#4da6ff" />
      </svg>
      <span className="text-xl font-bold leading-none tracking-tight">
        <span className="text-primary">Zync</span>
        <span className="text-white">mart</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const toggleCartDrawer = useCartStore((state) => state.toggleDrawer);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin');

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Close search on click outside the entire header
  useEffect(() => {
    if (!searchOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [searchOpen]);

  // Close search when route changes (navigation)
  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-secondary shadow-lg shadow-secondary/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <ZyncmartLogo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-0.5">
            {/* Search toggle button */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
              aria-controls="header-search-panel"
              className={`p-2 rounded-full transition-colors ${
                searchOpen
                  ? 'text-white bg-white/15'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="hidden sm:flex p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <button
              onClick={toggleCartDrawer}
              aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              className="relative p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <Link
              href={isAuthenticated ? '/account' : '/login'}
              aria-label="Account"
              className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              suppressHydrationWarning
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search panel (animated slide-down) */}
      <div id="header-search-panel">
        <HeaderSearchPanel isOpen={searchOpen} onClose={closeSearch} />
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-secondary/95 backdrop-blur-sm px-4 py-3 space-y-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center py-2.5 px-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center py-2.5 px-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
