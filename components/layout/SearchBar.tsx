'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({
  onClose,
  autoFocus = false,
  placeholder = 'Search jewellery, toys, home accessories…',
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose?.();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search products"
          className="h-11 w-full rounded-lg border border-border-strong bg-surface pl-10 pr-10 text-base text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 sm:text-sm"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Search
      </button>
    </form>
  );
}
