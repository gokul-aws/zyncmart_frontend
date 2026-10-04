'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import Dialog from '@/components/ui/Dialog';
import IconButton from '@/components/ui/IconButton';

interface ProductImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * One scroll-snap track for every screen size: swipe on touch, arrow buttons
 * and thumbnails elsewhere. Each slide opens an accessible full-screen view.
 * The parent remounts this (key) when the selected colour changes.
 */
export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const primaryIndex = Math.max(images.findIndex((i) => i.isPrimary), 0);
  // Primary image first, the rest in their stored order.
  const ordered = primaryIndex > 0 ? [images[primaryIndex], ...images.filter((_, i) => i !== primaryIndex)] : images;
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (index + ordered.length) % ordered.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    setActiveIndex(next);
  }, [ordered.length]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  if (!ordered.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface-muted text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  const multiple = ordered.length > 1;
  const lightboxImage = ordered[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="scrollbar-hide flex aspect-square snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-2xl bg-surface-muted"
          aria-label={`${productName} images`}
          role="region"
        >
          {ordered.map((img, i) => (
            <button
              key={img.publicId || img.url}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setLightboxOpen(true);
              }}
              className="relative h-full w-full flex-none snap-center cursor-zoom-in focus-visible:outline-offset-[-4px]"
              aria-label={`View image ${i + 1} of ${ordered.length} full screen`}
            >
              <Image
                src={img.url}
                alt={i === 0 ? productName : `${productName}, view ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {multiple && (
          <>
            <IconButton label="Previous image" variant="overlay" onClick={() => scrollTo(activeIndex - 1)} className="absolute left-3 top-1/2 hidden -translate-y-1/2 md:inline-flex">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </IconButton>
            <IconButton label="Next image" variant="overlay" onClick={() => scrollTo(activeIndex + 1)} className="absolute right-3 top-1/2 hidden -translate-y-1/2 md:inline-flex">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </IconButton>
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium tabular-nums text-white md:hidden" aria-hidden="true">
              {activeIndex + 1} / {ordered.length}
            </span>
          </>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm" aria-hidden="true">
          <Expand className="h-4 w-4" />
        </span>
      </div>

      {multiple && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto" role="group" aria-label="Choose image">
          {ordered.map((img, i) => (
            <button
              key={img.publicId || img.url}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-20',
                i === activeIndex ? 'border-ink' : 'border-transparent hover:border-border-strong'
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={lightboxOpen}
        onClose={() => {
          setLightboxOpen(false);
          // Keep the page gallery on the image last viewed full screen.
          scrollTo(activeIndex);
        }}
        title={productName} description={multiple ? `Image ${activeIndex + 1} of ${ordered.length}` : undefined} size="lg">
        <div
          className="relative aspect-square w-full"
          onKeyDown={(e) => {
            if (!multiple) return;
            if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % ordered.length);
            if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + ordered.length) % ordered.length);
          }}
        >
          <Image src={lightboxImage.url} alt={`${productName}, image ${activeIndex + 1}`} fill sizes="(max-width: 768px) 100vw, 672px" className="object-contain" />
          {multiple && (
            <>
              <IconButton label="Previous image" variant="overlay" onClick={() => setActiveIndex((i) => (i - 1 + ordered.length) % ordered.length)} className="absolute left-1 top-1/2 -translate-y-1/2">
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </IconButton>
              <IconButton label="Next image" variant="overlay" onClick={() => setActiveIndex((i) => (i + 1) % ordered.length)} className="absolute right-1 top-1/2 -translate-y-1/2">
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </IconButton>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}
