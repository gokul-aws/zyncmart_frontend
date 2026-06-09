import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { fetchCategory, fetchCategories } from '@/lib/api/categories';
import { buildCategoryMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';
import FilterSidebar from '@/components/filters/FilterSidebar';
import FilterDrawer from '@/components/filters/FilterDrawer';
import SortDropdown from '@/components/filters/SortDropdown';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';
import type { Category } from '@/types/category';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Zyncmart';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetchCategory(slug);
    if (!res.data) return { title: 'Category Not Found' };
    return buildCategoryMetadata(res.data);
  } catch {
    return { title: 'Category' };
  }
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;

  let category: Category | null = null;
  let categories: Category[] = [];

  try {
    const [catRes, catsRes] = await Promise.all([fetchCategory(slug), fetchCategories()]);
    category = catRes.data ?? null;
    categories = catsRes.data ?? [];
  } catch {
    // handled below
  }

  if (!category) notFound();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Categories', url: `${SITE_URL}/categories` },
    { name: category.name, url: `${SITE_URL}/categories/${category.slug}` },
  ]);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Buy ${category.name} Online | ${SITE_NAME}`,
    description:
      category.description ??
      `Shop ${category.name} products at ${SITE_NAME}. Best prices, fast delivery.`,
    url: `${SITE_URL}/categories/${category.slug}`,
    ...(category.image?.url ? { image: category.image.url } : {}),
  };

  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* CollectionPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-800 transition-colors">Home</Link></li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li><Link href="/categories" className="hover:text-gray-800 transition-colors">Categories</Link></li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium">{category.name}</li>
          </ol>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-gray-500 mb-6">{category.description}</p>
        )}

        <div className="flex gap-8 items-start">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <Suspense fallback={null}>
                <FilterSidebar categories={categories} />
              </Suspense>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div className="md:hidden">
                <Suspense fallback={null}>
                  <FilterDrawer categories={categories} defaultCategory={slug} />
                </Suspense>
              </div>
              <div className="md:ml-auto">
                <Suspense fallback={null}>
                  <SortDropdown />
                </Suspense>
              </div>
            </div>

            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <ProductGrid defaultCategory={slug} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
