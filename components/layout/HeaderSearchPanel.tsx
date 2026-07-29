'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import type { Product } from '@/types/product';

const TRENDING = ['Saree', 'Jewellery', 'Toys', 'Home Decor'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeaderSearchPanel({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const { data, isFetching, isPending, isReady } = useProductSearch(query);
  const suggestions: Product[] = data?.data ?? [];

  const isLoading = isReady && (isPending || isFetching);
  const showSuggestions = isOpen && isReady && suggestions.length > 0;
  const showTrending = isOpen && query.trim().length === 0;
  const showNoResults = isOpen && isReady && !isFetching && !isPending && suggestions.length === 0;
  const showDropdown = showSuggestions || showTrending || showNoResults;

  // Focus input when panel opens; clear state when it closes
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery('');
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Reset active index whenever suggestions list changes
  useEffect(() => setActiveIndex(-1), [suggestions]);

  const navigate = useCallback(
    (product: Product) => {
      router.push(`/products/${product.slug}`);
      onClose();
    },
    [router, onClose]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      navigate(suggestions[activeIndex]);
      return;
    }
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions)
          setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const primaryImage = (p: Product) =>
    p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? null;

  const highlight = (text: string) => {
    const q = query.trim();
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-primary font-semibold not-italic rounded px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    /*
     * Outer wrapper is `relative` — the dropdown anchors to its bottom edge.
     * The grid animation wrapper uses overflow-hidden on its *inner* div,
     * which would clip an absolutely-positioned child. Keeping the dropdown
     * OUTSIDE that overflow-hidden div fixes the clipping issue entirely.
     */
    <div className="relative">
      {/* ── Animated slide-down input bar (grid-rows trick) ─── */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden min-h-0">
          <div className="border-t border-white/10 bg-secondary/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <form role="search" onSubmit={handleSubmit}>
                <div className="relative flex items-center">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none shrink-0"
                    aria-hidden
                  />
                  <input
                    ref={inputRef}
                    id="header-search-input"
                    type="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-controls={showSuggestions ? listboxId : undefined}
                    aria-activedescendant={
                      activeIndex >= 0
                        ? `${listboxId}-opt-${activeIndex}`
                        : undefined
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products, categories, brands…"
                    className="w-full pl-10 pr-24 py-3 text-sm bg-white/10 text-white placeholder:text-white/50 border border-white/20 rounded-xl focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all"
                    tabIndex={isOpen ? 0 : -1}
                  />

                  {/* Loader · Clear · Submit */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isLoading && (
                      <Loader2
                        className="w-4 h-4 text-white/50 animate-spin"
                        aria-label="Searching…"
                      />
                    )}
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('');
                          inputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        className="p-1 text-white/50 hover:text-white transition-colors rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      aria-label="Submit search"
                      className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dropdown (sibling of the animated bar, NOT inside overflow-hidden) ── */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 px-4 sm:px-6 lg:px-8 pt-1.5">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/20 overflow-hidden">

              {/* Trending chips (empty query) */}
              {/* {showTrending && (
                <div className="p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trending searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 text-sm text-slate-700 bg-slate-100 hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Product suggestions */}
              {showSuggestions && (
                <>
                  <ul
                    id={listboxId}
                    role="listbox"
                    aria-label="Search suggestions"
                    className="py-2"
                  >
                    {suggestions.map((product, i) => {
                      const thumb = primaryImage(product);
                      const isActive = i === activeIndex;
                      return (
                        <li
                          key={product._id}
                          id={`${listboxId}-opt-${i}`}
                          role="option"
                          aria-selected={isActive}
                        >
                          <button
                            type="button"
                            onClick={() => navigate(product)}
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(-1)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isActive ? 'bg-primary/10' : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                              {thumb ? (
                                <Image
                                  src={thumb}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Search className="w-4 h-4 text-slate-300" />
                                </div>
                              )}
                            </div>

                            {/* Name + category */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {highlight(product.name)}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {product.category.name}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="shrink-0 text-right">
                              {product.price != null && (
                                <p className="text-sm font-semibold text-slate-900">
                                  ₹{product.price.toLocaleString('en-IN')}
                                </p>
                              )}
                              {product.comparePrice &&
                                product.price != null &&
                                product.comparePrice > product.price && (
                                  <p className="text-xs text-slate-400 line-through">
                                    ₹{product.comparePrice.toLocaleString('en-IN')}
                                  </p>
                                )}
                            </div>

                            <ArrowUpRight
                              className={`shrink-0 w-4 h-4 transition-colors ${
                                isActive ? 'text-primary' : 'text-slate-300'
                              }`}
                              aria-hidden
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* View all results footer */}
                  <div className="border-t border-slate-100 px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const q = query.trim();
                        if (!q) return;
                        router.push(`/search?q=${encodeURIComponent(q)}`);
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline py-1 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      View all results for &ldquo;{query.trim()}&rdquo;
                    </button>
                  </div>
                </>
              )}

              {/* No results */}
              {showNoResults && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No results for &ldquo;{query.trim()}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try a different keyword or browse all products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
