'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/formatters';

const PRICE_MIN = 0;
const PRICE_MAX = 50000;
const STEP = 500;

export default function PriceRangeSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minVal, setMinVal] = useState(
    Number(searchParams.get('minPrice') ?? PRICE_MIN)
  );
  const [maxVal, setMaxVal] = useState(
    Number(searchParams.get('maxPrice') ?? PRICE_MAX)
  );

  useEffect(() => {
    setMinVal(Number(searchParams.get('minPrice') ?? PRICE_MIN));
    setMaxVal(Number(searchParams.get('maxPrice') ?? PRICE_MAX));
  }, [searchParams]);

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

  const minPct = ((minVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((maxVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-medium text-gray-800">
        <span>{formatPrice(minVal)}</span>
        <span>{formatPrice(maxVal)}</span>
      </div>

      <div className="relative h-6 flex items-center select-none">
        {/* Track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />

        {/* Active fill */}
        <div
          className="absolute h-1.5 rounded-full bg-primary pointer-events-none"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />

        {/* Min range input (invisible) */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={STEP}
          value={minVal}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), maxVal - STEP);
            setMinVal(v);
          }}
          onMouseUp={() => commit(minVal, maxVal)}
          onTouchEnd={() => commit(minVal, maxVal)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal > PRICE_MAX / 2 ? 5 : 3 }}
          aria-label="Minimum price"
        />

        {/* Max range input (invisible) */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={STEP}
          value={maxVal}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), minVal + STEP);
            setMaxVal(v);
          }}
          onMouseUp={() => commit(minVal, maxVal)}
          onTouchEnd={() => commit(minVal, maxVal)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: maxVal < PRICE_MAX / 2 ? 5 : 4 }}
          aria-label="Maximum price"
        />

        {/* Visual min thumb */}
        <div
          className="absolute w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${minPct}%`, zIndex: 2 }}
        />

        {/* Visual max thumb */}
        <div
          className="absolute w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md pointer-events-none -translate-x-1/2"
          style={{ left: `${maxPct}%`, zIndex: 2 }}
        />
      </div>
    </div>
  );
}
