import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { fetchProduct, fetchProducts } from '@/lib/api/products';
import { buildProductMetadata, buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import type { Product } from '@/types/product';
import ProductPurchasePanel from '@/components/product/ProductPurchasePanel';
import ProductTabs from '@/components/product/ProductTabs';
import RelatedProducts from '@/components/product/RelatedProducts';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProduct(slug);
    return buildProductMetadata(product);
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let product;
  try {
    product = await fetchProduct(slug);
  } catch {
    notFound();
  }

  // Fetch related products (same category, best-effort)
  let relatedProducts: Product[] = [];
  try {
    const res = await fetchProducts({
      category: product.category.slug,
      limit: 10,
    });
    relatedProducts = res.data ?? [];
  } catch {
    // non-fatal — page renders without related products
  }

  const productJsonLd = buildProductJsonLd(product);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Products', url: `${SITE_URL}/products` },
    { name: product.category.name, url: `${SITE_URL}/categories/${product.category.slug}` },
    { name: product.name, url: `${SITE_URL}/products/${product.slug}` },
  ]);

  return (
    <>
      {/* Product JSON-LD — rich result eligibility */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.category.name, href: `/categories/${product.category.slug}` },
            { label: product.name },
          ]}
        />

        {/* Gallery + purchase panel (colour-variant aware) */}
        <ProductPurchasePanel product={product} />

        {/* Description | Specifications | Reviews */}
        <div className="mt-12 sm:mt-16">
          <ProductTabs product={product} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} currentProductId={product._id} categorySlug={product.category.slug} />
      )}
    </>
  );
}
