import type { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
}

export default function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
  const related = products.filter((p) => p._id !== currentProductId);
  if (!related.length) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display mb-4">You may also like</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {related.map((product) => (
          <div key={product._id} className="shrink-0 w-44 sm:w-52">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
