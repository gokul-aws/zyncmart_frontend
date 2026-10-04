'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/formatters';
import { PRICE_MAX, PRICE_MIN, PRICE_STEP } from '@/lib/productFilters';

/**
 * Two native range inputs layered on one track. Each keeps its own visible
 * thumb with a focus ring, and changes are applied after pointer release OR
 * a short pause in keyboard input (previously keyboard changes never applied).
 * Mount with a key derived from the URL so external changes reset it.
 */
export default function PriceRangeSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minVal, setMinVal] = useState(Number(searchParams.get('minPrice') ?? PRICE_MIN));
  const [maxVal, setMaxVal] = useState(Number(searchParams.get('maxPrice') ?? PRICE_MAX));
  const keyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (keyTimer.current) clearTimeout(keyTimer.current);
  }, []);

  const commit = useCallback(
    (min: number, max: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (min <= PRICE_MIN) params.delete('minPrice');
      else params.set('minPrice', String(min));
      if (max >= PRICE_MAX) params.delete('maxPrice');
      else params.set('maxPrice', String(max));
      params.delete('page');
      router.push(`?${params}`);
    },
    [router, searchParams]
  );

  const commitAfterKeys = (min: number, max: number) => {
    if (keyTimer.current) clearTimeout(keyTimer.current);
    keyTimer.current = setTimeout(() => commit(min, max), 600);
  };

  const minPct = ((minVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((maxVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const range = 'pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto';
  const thumb = 'pointer-events-none absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-primary shadow';

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-medium tabular-nums text-foreground" aria-hidden="true">
        <span>{formatPrice(minVal)}</span>
        <span>
          {formatPrice(maxVal)}
          {maxVal >= PRICE_MAX ? '+' : ''}
        </span>
      </div>

      <div className="relative flex h-8 select-none items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />
        <div className="pointer-events-none absolute h-1.5 rounded-full bg-primary" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />

        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={minVal}
          onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - PRICE_STEP))}
          onPointerUp={() => commit(minVal, maxVal)}
          onKeyUp={() => commitAfterKeys(minVal, maxVal)}
          className={`peer/min ${range}`}
          style={{ zIndex: minVal > PRICE_MAX / 2 ? 5 : 3 }}
          aria-label="Minimum price"
          aria-valuetext={formatPrice(minVal)}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={maxVal}
          onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + PRICE_STEP))}
          onPointerUp={() => commit(minVal, maxVal)}
          onKeyUp={() => commitAfterKeys(minVal, maxVal)}
          className={`peer/max ${range}`}
          style={{ zIndex: maxVal < PRICE_MAX / 2 ? 5 : 4 }}
          aria-label="Maximum price"
          aria-valuetext={formatPrice(maxVal)}
        />

        <div className={`${thumb} peer-focus-visible/min:ring-2 peer-focus-visible/min:ring-primary peer-focus-visible/min:ring-offset-2`} style={{ left: `${minPct}%` }} />
        <div className={`${thumb} peer-focus-visible/max:ring-2 peer-focus-visible/max:ring-primary peer-focus-visible/max:ring-offset-2`} style={{ left: `${maxPct}%` }} />
      </div>
    </div>
  );
}
