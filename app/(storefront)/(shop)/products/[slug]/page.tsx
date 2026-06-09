import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProduct, fetchProducts } from '@/lib/api/products';
import { buildProductMetadata, buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import type { Product } from '@/types/product';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-800 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li>
              <Link href="/products" className="hover:text-gray-800 transition-colors">
                Products
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-gray-800 transition-colors"
              >
                {product.category.name}
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product hero: gallery + info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Gallery */}
          <div className="md:sticky md:top-24 self-start">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Info */}
          <ProductInfo product={product} />
        </div>

        {/* Tabs: Description | Specifications | Reviews */}
        <div className="mb-12">
          <ProductTabs product={product} />
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} currentProductId={product._id} />
        )}
      </div>
    </>
  );
}
