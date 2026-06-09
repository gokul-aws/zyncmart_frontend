'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  {
    id: 1,
    eyebrow: 'New Collection',
    title: 'Exquisite\nJewellery',
    subtitle: 'Handcrafted gold, silver and fashion pieces for every occasion',
    cta: { label: 'Shop Jewellery', href: '/categories/jewellery' },
    secondaryCta: { label: 'View New Arrivals', href: '/products?sortBy=newest' },
    gradient: 'from-amber-950 via-amber-800 to-yellow-700',
    accent: 'bg-amber-400',
  },
  {
    id: 2,
    eyebrow: 'For Every Age',
    title: 'Toys That\nSpark Joy',
    subtitle: 'Safe, educational and fun toys for children of all ages',
    cta: { label: 'Shop Toys', href: '/categories/toys' },
    secondaryCta: { label: 'Top Picks', href: '/products?category=toys&isFeatured=true' },
    gradient: 'from-[#0d1b32] via-[#0d4fb5] to-[#1565d8]',
    accent: 'bg-[#4da6ff]',
  },
  {
    id: 3,
    eyebrow: 'Curated Spaces',
    title: 'Beautiful\nHome Accessories',
    subtitle: 'Transform your living space with our artisan collection',
    cta: { label: 'Shop Home', href: '/categories/home-accessories' },
    secondaryCta: { label: 'Free Ship on ₹999+', href: '/products' },
    gradient: 'from-emerald-950 via-teal-800 to-green-700',
    accent: 'bg-emerald-400',
  },
];

const SLIDE_DURATION = 5000;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

const contentVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: (delay: number) => ({ y: 0, opacity: 1, transition: { delay, duration: 0.4 } }),
};

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1);
  }, [current, goTo]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1);
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full h-[480px] sm:h-[560px] lg:h-[640px] overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
          aria-roledescription="slide"
          aria-label={`Slide ${current + 1} of ${SLIDES.length}: ${slide.title.replace('\n', ' ')}`}
        >
          {/* Decorative shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full ${slide.accent} opacity-10`} />
            <div className={`absolute bottom-0 -left-16 w-64 h-64 rounded-full ${slide.accent} opacity-10`} />
          </div>

          <div className="absolute inset-0 bg-black/20" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <motion.p
              key={`eyebrow-${current}`}
              custom={0.1}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className={`text-sm font-semibold uppercase tracking-widest mb-3 ${slide.accent.replace('bg-', 'text-')}`}
            >
              {slide.eyebrow}
            </motion.p>

            <motion.h1
              key={`title-${current}`}
              custom={0.2}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight whitespace-pre-line"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              key={`subtitle-${current}`}
              custom={0.3}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="text-base sm:text-lg text-white/85 mb-8 max-w-md"
            >
              {slide.subtitle}
            </motion.p>

            <motion.div
              key={`cta-${current}`}
              custom={0.4}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3"
            >
              <Link
                href={slide.cta.href}
                className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                {slide.cta.label}
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="inline-flex items-center border-2 border-white/70 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                {slide.secondaryCta.label}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
                   bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white
                   rounded-full p-2 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
                   bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white
                   rounded-full p-2 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2" role="tablist">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
