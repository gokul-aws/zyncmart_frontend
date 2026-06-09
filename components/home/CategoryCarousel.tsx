'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '@/types/category';

const FALLBACK_GRADIENTS = [
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
  'from-yellow-400 to-amber-500',
];

interface CategoryCarouselProps {
  categories: Category[];
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
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
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -560 : 560, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-2 z-10 flex items-center
                        bg-gradient-to-r from-white via-white/80 to-transparent pr-10 hidden md:flex">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll categories left"
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
            aria-label="Scroll categories right"
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
                   scrollbar-hide snap-x snap-mandatory"
      >
        {categories.map((category, i) => (
          <Link
            key={category._id}
            href={`/categories/${category.slug}`}
            className="flex-none snap-start group"
          >
            <div
              className="relative w-[130px] h-[130px] sm:w-[155px] sm:h-[155px] rounded-2xl overflow-hidden
                         shadow-sm ring-2 ring-transparent group-hover:ring-primary/40
                         transition-all duration-300"
            >
              {category.image?.url ? (
                <Image
                  src={category.image.url}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 130px, 155px"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}`}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-semibold leading-tight drop-shadow-sm">
                  {category.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
