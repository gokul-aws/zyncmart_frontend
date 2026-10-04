'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
import IconButton from '@/components/ui/IconButton';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllHref: string;
  /** Muted band behind the section. */
  tinted?: boolean;
}

/** Horizontal product rail: swipe on touch, arrow buttons (always visible) on larger screens. */
export default function ProductCarousel({ title, products, viewAllHref, tinted = false }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const headingId = useId();
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 4 });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const scroll = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className={tinted ? 'bg-surface-muted/60 py-12 sm:py-16' : 'py-12 sm:py-16'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id={headingId} className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <div className="flex items-center gap-1">
            <Link href={viewAllHref} className="mr-1 inline-flex h-11 items-center text-sm font-semibold text-primary hover:underline">
              View all<span className="sr-only"> {title.toLowerCase()}</span>
            </Link>
            <IconButton label={`Scroll ${title} left`} variant="outline" size="sm" onClick={() => scroll(-1)} disabled={edges.start} className="hidden md:inline-flex">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <IconButton label={`Scroll ${title} right`} variant="outline" size="sm" onClick={() => scroll(1)} disabled={edges.end} className="hidden md:inline-flex">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        </div>

        <ul
          ref={scrollRef}
          onScroll={measure}
          className="scrollbar-hide -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
        >
          {products.map((product, i) => (
            <li key={product._id} className="w-[44%] flex-none snap-start sm:w-[30%] lg:w-[calc((100%-3*1.25rem)/4)]">
              <ProductCard product={product} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
