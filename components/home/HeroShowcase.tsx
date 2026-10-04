'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

const SLIDE_MS = 6000;

// prefers-reduced-motion, read without a setState-in-effect.
const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia(motionQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);

/**
 * Rotating showcase of real categories (image + name + description from the
 * API). Accessible carousel: pause/play control, pauses while hovered or
 * focused, never auto-rotates when reduced motion is requested.
 */
export default function HeroShowcase({ categories }: { categories: Category[] }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const count = categories.length;
  const canRotate = count > 1 && !reducedMotion;
  const playing = canRotate && !userPaused && !hovered && !focused;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [playing, count]);

  if (count === 0) return null;
  const slide = categories[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Shop by category"
      className="relative overflow-hidden rounded-2xl bg-surface-muted"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      {/* Announce slide changes only when not auto-rotating. */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11]" aria-live={playing ? 'off' : 'polite'}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={slide._id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}: ${slide.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {slide.image?.url && (
              <Image src={slide.image.url} alt="" fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5 pt-16 sm:p-6 sm:pt-20">
              <p className="text-lg font-semibold text-white sm:text-xl">{slide.name}</p>
              {slide.description && <p className="mt-1 line-clamp-2 max-w-md text-sm text-white/90">{slide.description}</p>}
              <Link href={`/categories/${slide.slug}`} className="mt-3 inline-flex h-10 items-center gap-1 rounded-lg bg-white px-4 text-sm font-semibold text-foreground hover:bg-white/90">
                Shop {slide.name}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {canRotate && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? 'Start automatic slide show' : 'Stop automatic slide show'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
            >
              {userPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {count > 1 && (
        <div className="absolute left-3 top-4 flex sm:left-4">
          {categories.map((c, i) => (
            <button
              key={c._id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1}: ${c.name}`}
              aria-current={i === index ? 'true' : undefined}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span className={cn('block h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60')} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
