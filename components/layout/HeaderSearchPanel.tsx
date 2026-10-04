'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ChevronRight } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useCategories } from '@/hooks/useCategories';
import { summarizeProduct } from '@/lib/productDisplay';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface Props {
  isOpen: boolean;
  /** Close after navigating or clicking away. */
  onClose: () => void;
  /** Close via Escape — the header returns focus to its trigger. */
  onEscape?: () => void;
}

/**
 * Live product search (ARIA combobox). The header remounts this panel each
 * time it opens (key), so the query always starts empty.
 */
export default function HeaderSearchPanel({ isOpen, onClose, onEscape }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const { data, isFetching, isPending, isReady } = useProductSearch(query);
  const suggestions: Product[] = isReady ? data?.data ?? [] : [];
  const { data: categories = [] } = useCategories();
  const browseCategories = categories.filter((c) => c.isActive && !c.parent);

  const isLoading = isReady && (isPending || isFetching);
  const showSuggestions = isOpen && suggestions.length > 0;
  const showBrowse = isOpen && query.trim().length === 0 && browseCategories.length > 0;
  const showNoResults = isOpen && isReady && !isFetching && !isPending && suggestions.length === 0;
  const showDropdown = showSuggestions || showBrowse || showNoResults;

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  const navigate = useCallback(
    (product: Product) => {
      router.push(`/products/${product.slug}`);
      onClose();
    },
    [router, onClose]
  );

  const searchAll = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) navigate(suggestions[activeIndex]);
    else searchAll();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      (onEscape ?? onClose)();
    }
  };

  const highlight = (text: string) => {
    const q = query.trim();
    const idx = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded-sm bg-primary-subtle font-semibold text-foreground">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="relative">
      {/* Slide-down bar (grid-rows animation). Collapsed = inert, so nothing inside is focusable. */}
      <div className={cn('grid transition-[grid-template-rows] duration-200 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')} inert={!isOpen}>
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-white/10 bg-ink px-4 py-3 sm:px-6 lg:px-8">
            <form role="search" onSubmit={handleSubmit} className="mx-auto max-w-3xl">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  ref={inputRef}
                  id="header-search-input"
                  type="search"
                  role="combobox"
                  aria-label="Search products"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-controls={showSuggestions ? listboxId : undefined}
                  aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search jewellery, toys, home accessories…"
                  className="h-11 w-full rounded-lg border-0 bg-surface pl-10 pr-28 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
                />
                <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setActiveIndex(-1);
                        inputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button type="submit" className="h-8 rounded-md bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                    Search
                  </button>
                </div>
              </div>
              <p className="sr-only" aria-live="polite">
                {showSuggestions ? `${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'} available` : showNoResults ? 'No matching products' : ''}
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Dropdown sits outside the overflow-hidden bar so it isn't clipped. */}
      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-50 px-4 pt-2 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            {showBrowse && (
              <div className="p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Browse categories</p>
                <ul className="flex flex-wrap gap-2">
                  {browseCategories.map((cat) => (
                    <li key={cat._id}>
                      <Link href={`/categories/${cat.slug}`} onClick={onClose} className="inline-flex h-9 items-center rounded-full bg-surface-muted px-3 text-sm text-foreground hover:bg-primary-subtle hover:text-primary">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showSuggestions && (
              <>
                <ul id={listboxId} role="listbox" aria-label="Product suggestions" className="max-h-[60vh] overflow-y-auto py-1.5">
                  {suggestions.map((product, i) => {
                    const summary = summarizeProduct(product);
                    const isActive = i === activeIndex;
                    return (
                      <li
                        key={product._id}
                        id={`${listboxId}-opt-${i}`}
                        role="option"
                        aria-selected={isActive}
                        // Keep focus in the input (combobox pattern).
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => navigate(product)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5', isActive && 'bg-surface-muted')}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                          {summary.image && <Image src={summary.image} alt="" fill sizes="48px" className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{highlight(product.name)}</p>
                          <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {summary.hasPriceRange && <span className="font-normal text-muted-foreground">From </span>}
                          {formatPrice(summary.price)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-border">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={searchAll}
                    className="flex h-11 w-full items-center justify-center gap-1 text-sm font-semibold text-primary hover:bg-surface-muted"
                  >
                    View all results for &ldquo;{query.trim()}&rdquo;
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </>
            )}

            {showNoResults && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No results for &ldquo;{query.trim()}&rdquo;</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different word, or browse all products.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
