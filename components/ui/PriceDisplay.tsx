import { formatPrice, discountPercent } from '@/lib/formatters';

interface PriceDisplayProps {
  price: number;
  comparePrice?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ price, comparePrice, size = 'md' }: PriceDisplayProps) {
  const showDiscount = comparePrice && comparePrice > price;
  const priceSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl' };

  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className={`font-bold text-gray-900 ${priceSizes[size]}`}>
        {formatPrice(price)}
      </span>
      {showDiscount && (
        <>
          <span className="text-gray-400 line-through text-sm">
            {formatPrice(comparePrice)}
          </span>
          <span className="text-green-600 text-xs font-semibold">
            {discountPercent(price, comparePrice)}% off
          </span>
        </>
      )}
    </div>
  );
}
