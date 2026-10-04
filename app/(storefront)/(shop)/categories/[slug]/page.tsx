import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCategory, fetchCategories } from '@/lib/api/categories';
import { buildCategoryMetadata, buildBreadcrumbJsonLd } from '@/lib/seo';
import ProductListingLayout from '@/components/listing/ProductListingLayout';
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

      <ProductListingLayout
        title={category.name}
        description={category.description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: category.name }]}
        categories={categories}
        defaultCategory={slug}
      />
    </>
  );
}
