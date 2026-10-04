import type { Product } from '@/types/product';
import ProductCarousel from '@/components/home/ProductCarousel';

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  categorySlug: string;
}

export default function RelatedProducts({ products, currentProductId, categorySlug }: RelatedProductsProps) {
  const related = products.filter((p) => p._id !== currentProductId);
  if (!related.length) return null;
  return <ProductCarousel title="You may also like" products={related} viewAllHref={`/categories/${categorySlug}`} />;
}
