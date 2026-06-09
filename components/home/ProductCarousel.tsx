'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-none w-[165px] sm:w-[200px] rounded-xl overflow-hidden border border-gray-100 bg-white animate-pulse">
          <div className="aspect-[4/5] bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-2.5 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -660 : 660, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-2 z-10 flex items-center
                        bg-gradient-to-r from-white via-white/80 to-transparent pr-10 hidden md:flex">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll products left"
            className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-200
                       flex items-center justify-center text-gray-600
                       hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Right fade + arrow */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-2 z-10 flex items-center
                        bg-gradient-to-l from-white via-white/80 to-transparent pl-10 hidden md:flex">
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll products right"
            className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-200
                       flex items-center justify-center text-gray-600
                       hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6
                   scrollbar-hide snap-x"
      >
        {products.map((product, i) => (
          <div key={product._id} className="flex-none snap-start w-[165px] sm:w-[200px]">
            <ProductCard product={product} priority={i < 4} />
          </div>
        ))}
      </div>
    </div>
  );
}
